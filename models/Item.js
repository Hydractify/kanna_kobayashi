/* eslint-disable new-cap */

const { BOOLEAN, ENUM, INTEGER, STRING, Model } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

class Item extends Model { }

Item.init({
	name: {
		type: STRING,
		primaryKey: true
	},
	type: {
		allowNull: false,
		type: ENUM,
		values: ['BADGE', 'ITEM']
	},
	rarity: {
		allowNull: false,
		type: ENUM,
		// TODO: Rarities here
		values: []
	},
	buyable: {
		allowNull: false,
		defaultValue: true,
		type: BOOLEAN
	},
	price: { type: INTEGER }
}, {
	createdAt: false,
	name: {
		singular: 'item',
		plural: 'items'
	},
	sequelize: db,
	updatedAt: false
});

module.exports = Item;
