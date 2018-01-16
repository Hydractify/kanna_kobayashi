import { Op } from 'sequelize';
import {
	AllowNull,
	BelongsToMany,
	Column,
	DataType,
	Model,
	PrimaryKey,
	Scopes,
	Table,
	Validate,
} from 'sequelize-typescript';

import { ItemRarities } from '../types/ItemRarities';
import { ItemTypes } from '../types/ItemTypes';
import { User } from './User';
import { UserItem } from './UserItem';

@Scopes({
	coin: {
		where: {
			rarity: {
				// rarity < 5
				[Op.lt]: ItemRarities.DRAGON_SCALE,
			},
		},
	},
	scale: {
		where: {
			rarity: {
				// rarity > 5
				[Op.gt]: ItemRarities.DRAGON_SCALE,
			},
		},
	},
})
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
		foreignKey: 'item_name',
		otherKey: 'user_id',
		through: (): typeof Model => UserItem,
	})
	public holders: User[];

	@AllowNull(false)
	@PrimaryKey
	@Column({
		type: DataType.STRING('32'),
	})
	public name: string;

	@Column(DataType.INTEGER)
	public price: number;

	@AllowNull(false)
	@Column(DataType.INTEGER)
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

	// tslint:disable-next-line:variable-name
	private UserItem: UserItem;

	public getCount(): number {
		if (!this.UserItem) return null;

		return this.UserItem.count;
	}

	public async setAndSaveCount(value: number): Promise<this> {
		if (!this.UserItem) throw new Error(`This "${this.name}" is not associated with any user!`);

		this.UserItem.count = value;
		await this.UserItem.save();

		return this;
	}

	/**
	 * Additional meta data about an item, such as the holder id and the item count
	 * **Only present if fetched via association!**
	 */
	public get userItem(): UserItem {
		return this.UserItem;
	}
	public set userItem(value: UserItem) {
		this.UserItem = value;
	}
}
