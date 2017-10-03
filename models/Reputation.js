/* eslint-disable new-cap */

const { ENUM, STRING, Model } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

class Reputation extends Model { }

Reputation.init(
	{
		sourceId: {
			field: 'source_id',
			type: STRING('20'),
			unique: 'reputation-target-source-index'
		},
		targetId: {
			field: 'target_id',
			type: STRING('20'),
			unique: 'reputation-target-source-index'
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
		tableName: 'reputations',
		updatedAt: false
	}
);

module.exports = Reputation;
