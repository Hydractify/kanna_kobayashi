// tslint:disable member-ordering

import { GuildMember, Role } from 'discord.js';
import { RedisClient } from 'redis-p';
import {
	AfterCreate,
	AfterSave,
	AfterUpdate,
	AfterUpsert,
	BelongsToMany,
	Column,
	DataType,
	HasMany,
	HasOne,
	Model,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';

import { ItemTypes } from '../types/ItemTypes';
import { PermLevels } from '../types/PermLevels';
import { UserTypes } from '../types/UserTypes';
import { generateColor } from '../util/generateColor';
import { Redis } from '../util/RedisDecorator';
import { CommandLog } from './CommandLog';
import { Guild } from './Guild';
import { Item } from './Item';
import { UserItem } from './UserItem';
import { UserReputation } from './UserReputation';

@Redis(true)
@Table({
	createdAt: false,
	tableName: 'users',
	underscored: true,
	updatedAt: false,
})
export class User extends Model<User> {
	/**
	 * Fetch a model by id.
	 * This will either come from redis, or from postgres if not available.
	 */
	public static async fetchOrCache(id: string): Promise<User> {
		const redisData: { [key: string]: string } = await this.redis.hgetall(`users:${id}`);
		if (redisData) return User.fromRedis(redisData);

		const [user, created]: [User, boolean] = await User.findCreateFind<User>({ where: { id } });
		if (!created) this.updateRedis(user);

		return user;
	}

	/**
	 * Build a User model from redis data.
	 */
	public static fromRedis(data: { [key: string]: string | number | Date }, isNewRecord: boolean = false): User {
		if (data.partnerSince) data.partnerSince = new Date(Number(data.partnerSince));

		data.coins = Number(data.coins) || 0;
		data.exp = Number(data.exp) || 0;
		data.tier = Number(data.tier) || 0;

		return new this(data, { isNewRecord });
	}

	/**
	 * Cache or update a user instance into redis
	 */
	@AfterCreate
	@AfterUpdate
	@AfterSave
	@AfterUpsert
	private static updateRedis(user: User): Promise<string | string[]> {
		const data: { [key: string]: string | number } = user.toJSON();
		const nullKeys: string[] = [];

		if (data.partnerSince) data.partnerSince = data.partnerSince.valueOf();

		for (const [k, v] of Object.entries(data)) {
			// tslint:disable-next-line:no-null-keyword
			if ([null, undefined].includes(v)) {
				delete data[k];
				nullKeys.push(k);
			}
		}

		if (!nullKeys.length) {
			return this.redis.hmset(`users:${user.id}`, data);
		}

		return this.redis.multi()
			.hmset(`users:${user.id}`, data)
			.hdel(`users:${user.id}`, ...nullKeys)
			.exec();
	}

	/**
	 * Reference to the redis client
	 */
	private static redis: RedisClient;

	/**
	 * Current level of the User
	 */
	public get level(): number {
		return Math.floor(Math.sqrt(this.exp / 1000)) + 1;
	}

	/**
	 * Color for this user, either random, or preset for DEVs or trusted
	 */
	public get color(): number {
		if (this.type === UserTypes.DEV) return 0x00000F;
		if (this.type === UserTypes.TRUSTED) return 0xFFFFFF;

		return generateColor();
	}

	/**
	 * Computes the perm level of this user,
	 * optionally based on a member passed.
	 */
	public permLevel(member?: GuildMember): PermLevels {
		if (this.type === UserTypes.DEV) {
			return PermLevels.DEV;
		}
		if (this.type === UserTypes.TRUSTED) {
			return PermLevels.TRUSTED;
		}

		if (member) {
			const { permissions }: GuildMember = member;

			if (permissions.has('MANAGE_GUILD') || permissions.has(['BAN_MEMBERS', 'KICK_MEMBERS'])) {
				return PermLevels.HUMANTAMER;
			}

			const model: Guild = member.guild.model;
			if ((model && model.tamerRoleId && member.roles.has(model.tamerRoleId))
				|| member.roles.exists((role: Role) => role.name.toLowerCase() === 'dragon tamer')) {
				return PermLevels.DRAGONTAMER;
			}
		}

		return PermLevels.EVERYONE;
	}

	@PrimaryKey
	@Column
	public readonly id: string;

	@HasMany(() => CommandLog, {
		as: 'commandLogs',
		foreignKey: 'user_id',
	})
	public readonly commandLogs: CommandLog[];

	@Column
	public coins: number;

	@Column
	public exp: number;

	@Column({
		type: DataType.ENUM,
		values: Object.keys(UserTypes),
	})
	public type: UserTypes;

	/**
	 * Patreon tier
	 */
	@Column(DataType.INTEGER)
	public tier: number;

	@HasOne(() => User, {
		as: 'partner',
		foreignKey: 'partnerId',
	})
	public readonly partner: User;

	@Column({
		field: 'partner_id',
		type: DataType.STRING('20'),
	})
	public partnerId: string;

	@Column({
		field: 'partner_since',
		type: DataType.DATE,
	})
	public partnerSince: Date;

	@Column({
		field: 'partner_married',
		type: DataType.BOOLEAN,
	})
	public partnerMarried: boolean;

	@BelongsToMany(() => Item, {
		as: 'badges',
		foreignKey: 'user_id',
		otherKey: 'item_id',
		scope: { type: ItemTypes.BADGE },
		through: (): typeof Model => UserItem,
	})
	public readonly badges: Item[];

	@BelongsToMany(() => Item, {
		as: 'items',
		foreignKey: 'user_id',
		otherKey: 'item_id',
		scope: { type: ItemTypes.ITEM },
		through: (): typeof Model => UserItem,
	})
	public readonly items: Item[];

	/**
	 * All users who added a reputation to the user
	 */
	@BelongsToMany(() => User, {
		as: 'reps',
		foreignKey: 'rep_id',
		otherKey: 'repper_id',
		through: (): typeof Model => UserReputation,
	})
	public readonly reps: User[];

	/**
	 * All users the user added a reputation
	 */
	@BelongsToMany(() => User, {
		as: 'repped',
		foreignKey: 'repper_id',
		otherKey: 'rep_id',
		through: (): typeof Model => UserReputation,
	})
	public readonly repped: User[];
}
