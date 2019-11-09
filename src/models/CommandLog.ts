import { AllowNull, Column, CreatedAt, DataType, Table } from 'sequelize-typescript';

import { Model } from '../structures/Model';

/**
 * Keeps track of command usages
 */
@Table({
	tableName: 'command_logs',
	underscored: true,
	updatedAt: false,
})
export class CommandLog extends Model<CommandLog>
{
	/**
	 * Name of the command
	 */
	@AllowNull(false)
	@Column({
		field: 'command_name',
		type: DataType.TEXT,
	})
	public readonly commandName!: string;

	/**
	 * Guild Id where this command ran
	 */
	@Column({
		field: 'guild_id',
		type: DataType.TEXT,
	})
	public readonly guildId!: string;

	/**
	 * When the command ran
	 */
	@CreatedAt
	public readonly run!: Date;

	/**
	 * Id of the user that used the command
	 */
	@AllowNull(false)
	@Column({
		field: 'user_id',
		type: DataType.TEXT,
	})
	public readonly userId!: string;
}
