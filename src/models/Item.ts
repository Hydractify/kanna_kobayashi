import {
	AllowNull,
	BelongsToMany,
	Column,
	DataType,
	Model,
	Table,
	Unique,
	Validate,
} from 'sequelize-typescript';

import { ItemRarities } from '../types/ItemRarities';
import { ItemTypes } from '../types/ItemTypes';
import { User } from './User';
import { UserItem } from './UserItem';

@Table({
	createdAt: false,
	tableName: 'items',
	underscored: true,
	updatedAt: false,
})
export class Item extends Model<Item> {
	@AllowNull(false)
	@Validate({
		isPriceSet: (value: Item): void => {
			if (value && this.price === undefined) {
				throw new Error(`The buyable item "${this.name}" must have a price!`);
			}
			if (!value && this.price !== undefined) {
				throw new Error(`The not buyable item "${this.name}" has a price; Did you intend it to be buyable?`);
			}
		},
	})
	@Column({
		defaultValue: false,
		type: DataType.BOOLEAN,
	})
	public buyable: boolean;

	@Column
	public description: string;

	@BelongsToMany(() => User, {
		as: 'holders',
		joinTableAttributes: ['count'],
		otherKey: 'user_id',
		through: (): typeof Model => UserItem,
		foreignKey: 'item_id',
	})
	public holders: User[];

	@AllowNull(false)
	@Unique
	@Column
	public name: string;

	@Column(DataType.INTEGER)
	public price: number;

	@AllowNull(false)
	@Column({
		type: DataType.ENUM,
		values: Object.keys(ItemRarities),
	})
	public rarity: ItemRarities;

	@AllowNull(false)
	@Column({
		defaultValue: false,
		type: DataType.BOOLEAN,
	})
	public tradable: boolean;

	@AllowNull(false)
	@Column({
		type: DataType.ENUM,
		values: Object.keys(ItemTypes),
	})
	public type: ItemTypes;

	@AllowNull(false)
	@Column({
		defaultValue: true,
		type: DataType.BOOLEAN,
	})
	public unique: boolean;
}
