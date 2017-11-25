import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

import { UserReputationTypes } from '../types/UserReputationTypes';

@Table({
	createdAt: false,
	tableName: 'user_reputations',
	underscored: true,
	updatedAt: false,
})
export class UserReputation extends Model<UserReputation> {
	/**
	 * Target id
	 */
	@PrimaryKey
	@Column({
		field: 'rep_id',
		type: DataType.STRING('20'),
	})
	public readonly repId: string;

	/**
	 * Source id
	 */
	@PrimaryKey
	@Column({
		field: 'repper_id',
		type: DataType.STRING('20'),
	})
	public readonly repperId: string;

	/**
	 * Type (positive or negative)
	 */
	@Column({ type: DataType.ENUM, values: Object.keys(UserReputationTypes) })
	public readonly type: UserReputationTypes;
}
