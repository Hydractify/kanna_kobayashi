/* eslint-disable new-cap */

const { BOOLEAN, ENUM, INTEGER, STRING, Model } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

class Item extends Model { }

Item.init({
	name: {
		type: STRING,
		unique: true
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
		values: ['?', 'LIMITED', 'IMM', 'CH', 'HM', 'DSIZE', 'UR', 'R', 'UC', 'C']
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
	tableName: 'items',
	sequelize: db,
	updatedAt: false
});

module.exports = Item;
