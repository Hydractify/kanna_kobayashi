import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
	createdAt: false,
	tableName: 'user_blocks',
	underscored: true,
	updatedAt: false,
})
export class UserBlock extends Model<UserBlock> {
	/**
	 * Target id
	 */
	@PrimaryKey
	@Column({
		field: 'blocked_id',
		type: DataType.TEXT,
	})
	public readonly blockedId!: string;

	/**
	 * Source id
	 */
	@PrimaryKey
	@Column({
		field: 'blocker_id',
		type: DataType.TEXT,
	})
	public readonly blockerId!: string;
}
