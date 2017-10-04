/* eslint-disable new-cap */

const { INTEGER, STRING, Model } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

class UserItem extends Model { }

UserItem.init(
	{
		userId: {
			field: 'user_id',
			primaryKey: true,
			type: STRING('20')
		},
		itemId: {
			field: 'item_id',
			primaryKey: true,
			type: INTEGER
		},
		count: {
			defaultValue: 1,
			type: INTEGER
		}
	},
	{
		createdAt: false,
		sequelize: db,
		tableName: 'user_items',
		updatedAt: false
	}
);

module.exports = UserItem;
