import { Column, DataType, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';

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
		type: DataType.STRING('1500'),
	})
	public farewellMessage: string;

	@PrimaryKey
	@Column(DataType.STRING('20'))
	public readonly id: string;

	@Column({
		field: 'level_up_enabled',
		type: DataType.BOOLEAN,
	})
	public levelUpEnabled: boolean;

	@Column({
		field: 'notification_channel_id',
		type: DataType.STRING('20'),
	})
	public notificationChannelId: string;

	@Column({
		set(this: Guild, value: string): void {
			this.setDataValue('prefix', value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
		},
		type: DataType.STRING('32'),
	})
	public prefix: string;

	@HasOne(() => Quiz, 'guildId')
	public quiz: Quiz;

	@Column({
		field: 'self_role_ids',
		type: DataType.ARRAY(DataType.STRING('20')),
	})
	public selfRoleIds: string[];

	@Column({
		field: 'tamer_role_id',
		type: DataType.STRING('20'),
	})
	public tamerRoleId: string;

	@Column({
		field: 'welcome_message',
		type: DataType.STRING('1500'),
	})
	public welcomeMessage: string;
}
