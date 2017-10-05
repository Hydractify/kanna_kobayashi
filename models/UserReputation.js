/* eslint-disable new-cap */

const { ENUM, STRING, Model } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

class UserReputation extends Model { }

UserReputation.init(
	{
		repperId: {
			field: 'repper_id',
			type: STRING('20'),
			primaryKey: true
		},
		repId: {
			field: 'rep_id',
			type: STRING('20'),
			primaryKey: true
		},
		type: {
			allowNull: false,
			type: ENUM,
			values: ['POSITIVE', 'NEGATIVE']
		}
	},
	{
		createdAt: false,
		sequelize: db,
		tableName: 'user_reputations',
		updatedAt: false
	}
);

module.exports = UserReputation;
