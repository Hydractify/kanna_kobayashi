import { Column, DataType, PrimaryKey, Table } from 'sequelize-typescript';

import { Model } from '../structures/Model';

@Table({
	createdAt: false,
	tableName: 'user_items',
	underscored: true,
	updatedAt: false,
})
export class UserItem extends Model<UserItem> 
{
	@Column({
		defaultValue: 1,
		type: DataType.INTEGER,
	})
	public count!: number;

	@PrimaryKey
	@Column({
		field: 'item_name',
		type: DataType.TEXT,
	})
	public readonly itemName!: number;

	@PrimaryKey
	@Column({
		field: 'user_id',
		type: DataType.TEXT,
	})
	public readonly userId!: string;
}
