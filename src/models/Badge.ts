import {
	AllowNull,
	BelongsToMany,
	Column,
	DataType,
	PrimaryKey,
	Table,
} from 'sequelize-typescript';

import { Model } from '../structures/Model';
import { Badges } from '../types/Badges';
import { User } from './User';
import { UserItem } from './UserItem';

@Table({
	createdAt: false,
	// Yes, the name is correct.
	tableName: 'items',
	underscored: true,
	updatedAt: false,
})
export class Badge extends Model<Badge> 
{
	@Column
	public description!: string;

	@BelongsToMany(() => User, {
		as: 'holders',
		foreignKey: 'item_name',
		otherKey: 'user_id',
		through: (): typeof Model => UserItem,
	})
	public holders!: User[];

	@AllowNull(false)
	@PrimaryKey
	@Column({
		type: DataType.TEXT,
	})
	public name!: Badges;

	// tslint:disable-next-line:variable-name
	private UserItem: UserItem | undefined;

	public getCount(): number 
	{
		if (!this.UserItem) throw new Error(`This "${this.name}" is not associated with any user!`);

		return this.UserItem.count;
	}

	public async setAndSaveCount(value: number): Promise<this> 
	{
		if (!this.UserItem) throw new Error(`This "${this.name}" is not associated with any user!`);

		this.UserItem.count = value;
		await this.UserItem.save();

		return this;
	}

	/**
	 * Additional meta data about an item, such as the holder id and the item count
	 * **Only present if fetched via association!**
	 */
	public get userItem(): UserItem | undefined 
	{
		return this.UserItem;
	}
}
