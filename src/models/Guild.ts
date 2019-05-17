import { Column, DataType, HasOne, PrimaryKey, Table } from 'sequelize-typescript';

import { Model } from '../structures/Model';
import { Quiz } from './Quiz';

@Table({
	createdAt: false,
	tableName: 'guilds',
	underscored: true,
	updatedAt: false,
})
export class Guild extends Model<Guild> {
	@Column({
		field: 'farewell_message',
		type: DataType.TEXT,
	})
	public farewellMessage!: string | null;

	@PrimaryKey
	@Column(DataType.TEXT)
	public readonly id!: string;

	@Column({
		defaultValue: [],
		field: 'disabled_commands',
		type: DataType.ARRAY(DataType.TEXT),
	})
	public disabledCommands!: string[];

	@Column({
		field: 'level_up_enabled',
		type: DataType.BOOLEAN,
	})
	public levelUpEnabled!: boolean | null;

	@Column({
		field: 'notification_channel_id',
		type: DataType.TEXT,
	})
	public notificationChannelId!: string | null;

	@Column({
		set(this: Model<Guild>, value: string): void {
			this.setDataValue('prefix', value ? value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') : null);
		},
		type: DataType.TEXT,
	})
	public prefix!: string | null;

	@HasOne(() => Quiz, 'guildId')
	public quiz?: Quiz;

	@Column({
		defaultValue: [],
		field: 'self_role_ids',
		type: DataType.ARRAY(DataType.TEXT),
	})
	public selfRoleIds!: string[];

	@Column({
		field: 'tamer_role_id',
		type: DataType.TEXT,
	})
	public tamerRoleId!: string | null;

	@Column({
		field: 'welcome_message',
		type: DataType.TEXT,
	})
	public welcomeMessage!: string | null;
}
