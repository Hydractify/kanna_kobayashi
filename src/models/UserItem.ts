import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
	createdAt: false,
	tableName: 'user_items',
	underscored: true,
	updatedAt: false,
})
export class UserItem extends Model<UserItem> {
	@Column({
		defaultValue: 1,
		type: DataType.INTEGER,
	})
	public count: number;

	@PrimaryKey
	@Column({
		field: 'item_name',
		type: DataType.STRING('32'),
	})
	public readonly itemName: number;

	@PrimaryKey
	@Column({
		field: 'user_id',
		type: DataType.STRING('20'),
	})
	public readonly userId: string;
}
