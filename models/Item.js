/* eslint-disable new-cap */

const { BOOLEAN, ENUM, INTEGER, STRING, Model } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

class Item extends Model {
	setItemCount(count, options = {}) {
		if (!this.UserItem) {
			throw new Error([
				`"${this.name}" does not have an item count associated with it!`,
				'Maybe not from an associated user?'
			].join('\n'));
		}

		this.UserItem.count = count;
		return this.UserItem.save(options);
	}

	get count() {
		if (!this.UserItem) return undefined;
		return this.UserItem.count;
	}
}

Item.init(
	{
		name: {
			type: STRING,
			unique: true
		},
		description: {
			type: STRING(1024),
			allowNull: true
		},
		type: {
			allowNull: false,
			type: ENUM,
			values: ['BADGE', 'ITEM']
		},
		rarity: {
			allowNull: false,
			type: ENUM,
			values: ['?', 'LIMITED', 'IMM', 'CH', 'HM', 'DSIZE', 'UR', 'R', 'UC', 'C']
		},
		buyable: {
			allowNull: false,
			defaultValue: true,
			type: BOOLEAN,
			validate: {
				isPriceSet: function checkPrice(value) {
					if (value && this.price === undefined) {
						throw new Error(`The buyable item "${this.name}" must have a price!`);
					} else if (!value && this.price !== undefined) {
						throw new Error(`The not buyable item "${this.name}" has a price; Did you intend it to be buyable?`);
					}
				}
			}
		},
		price: { type: INTEGER },
		tradable: {
			allowNull: false,
			type: BOOLEAN,
			defaultValue: false
		}
	},
	{
		createdAt: false,
		name: {
			singular: 'item',
			plural: 'items'
		},
		tableName: 'items',
		sequelize: db,
		updatedAt: false
	}
);

module.exports = Item;
