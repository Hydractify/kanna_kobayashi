// tslint:disable member-ordering

import { GuildMember, Role } from 'discord.js';
import { RedisClient } from 'redis-p';
import { QueryOptions, QueryTypes } from 'sequelize';
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

import { Redis } from '../decorators/RedisDecorator';
import { Badges } from '../types/Badges';
import { PermLevels } from '../types/PermLevels';
import { UserTypes } from '../types/UserTypes';
import { generateColor } from '../util/generateColor';
import { Badge } from './Badge';
import { CommandLog } from './CommandLog';
import { Guild } from './Guild';
import { UserBlock } from './UserBlock';
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
	public static async fetch(id: string): Promise<User> {
		const redisData: { [key: string]: string } = await this.redis.hgetall(`users:${id}`);
		if (redisData) return User.fromRedis(redisData);

		const [user, created]: [User, boolean] = await User.findCreateFind<User>({ where: { id } });
		if (!created) this.updateRedis(user);

		return user;
	}

	/**
	 * Build a User model from redis data.
	 */
	public static fromRedis(data: { [key: string]: string | number | Date }): User {
		if (data.partnerSince) data.partnerSince = new Date(Number(data.partnerSince));

		data.exp = Number(data.exp) || 0;
		data.tier = Number(data.tier) || 0;

		const user: User = new this(data, { isNewRecord: false });

		return user;
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
			if (v === null) {
				delete data[k];
				nullKeys.push(k);
			} else if (v === undefined) {
				delete data[k];
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
		return Math.floor(Math.sqrt(this.exp / 25)) + 1;
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
				|| member.roles.find((role: Role) => role.name.toLowerCase() === 'dragon tamer')) {
				return PermLevels.DRAGONTAMER;
			}
		}

		return PermLevels.EVERYONE;
	}

	/**
	 * Adds or increments the count of an item a user has.
	 * @param item An instanceof Item or an element of the Items enum
	 * @param count Optional number of items to give, defaults to 1
	 * @returns New item count
	 */
	public async addItem(item: Badge | Badges, count: number = 1, options: QueryOptions = {}): Promise<number> {
		const itemName: string = typeof item === 'string'
			? item
			: item.name;

		const [{ count: newCount }]: [{ count: number }] = await this.sequelize.query(`
			INSERT INTO "user_items" ("count", "item_name", "user_id")
			VALUES(:count, :itemName, :userId)
				ON CONFLICT ("item_name", "user_id")
				DO UPDATE
					SET "count"="user_items"."count"+:count
					WHERE
						"user_items"."item_name"=:itemName
						AND "user_items"."user_id"=:userId
			RETURNING "count";
			`,
			{
				...options,
				replacements: {
					count,
					itemName,
					userId: this.id,
				},
				// Technically an upsert but sequelize
				// maps select more conveniently here
				type: QueryTypes.SELECT,
			},
		);

		return newCount;
	}

	@PrimaryKey
	@Column
	public readonly id!: string;
	@HasMany(() => CommandLog, {
		as: 'commandLogs',
		foreignKey: 'user_id',
	})
	public readonly commandLogs: CommandLog[] | undefined;

	@Column({
		defaultValue: 0,
		type: DataType.INTEGER,
	})
	public exp!: number;

	@Column({
		type: DataType.ENUM,
		values: Object.keys(UserTypes),
	})
	public type!: UserTypes | null;

	/**
	 * Patreon tier
	 */
	@Column({
		defaultValue: 0,
		type: DataType.INTEGER,
	})
	public tier!: number;

	@HasOne(() => User, {
		as: 'partner',
		foreignKey: 'partnerId',
	})
	public readonly partner!: User | null;

	@Column({
		field: 'partner_id',
		type: DataType.TEXT,
	})
	public partnerId!: string | null;

	@Column({
		field: 'partner_since',
		type: DataType.DATE,
	})
	public partnerSince!: Date | null;

	@Column({
		field: 'partner_married',
		type: DataType.BOOLEAN,
	})
	public partnerMarried!: boolean | null;

	@BelongsToMany(() => Badge, {
		as: 'badges',
		foreignKey: 'user_id',
		otherKey: 'item_name',
		through: (): typeof Model => UserItem,
	})
	public readonly badges: Badge[] | undefined;

	/**
	 * All users who added a reputation to the user
	 */
	@BelongsToMany(() => User, {
		as: 'reps',
		foreignKey: 'rep_id',
		otherKey: 'repper_id',
		through: (): typeof Model => UserReputation,
	})
	public readonly reps: User[] | undefined;

	/**
	 * All users the user added a reputation
	 */
	@BelongsToMany(() => User, {
		as: 'repped',
		foreignKey: 'repper_id',
		otherKey: 'rep_id',
		through: (): typeof Model => UserReputation,
	})
	public readonly repped: User[] | undefined;

	/**
	 * All users which blocked this user.
	 */
	@BelongsToMany(() => User, {
		as: 'blocks',
		foreignKey: 'blocker_id',
		otherKey: 'blocked_id',
		through: (): typeof Model => UserBlock,
	})
	public readonly blocks: User[] | undefined;

	/**
	 * All the users which this user blocked.
	 */
	@BelongsToMany(() => User, {
		as: 'blocked',
		foreignKey: 'blocked_id',
		otherKey: 'blocker_id',
		through: (): typeof Model => UserBlock,
	})
	public readonly blocked: User[] | undefined;
}
