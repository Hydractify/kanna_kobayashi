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
		return this.UserItem.save(options)
			.then(() => this);
	}

	get count() {
		if (!this.UserItem) return undefined;
		return this.UserItem.count;
	}
}

Item.init(
	{
		buyable: {
			allowNull: false,
			defaultValue: false,
			type: BOOLEAN,
			validate: {
				isPriceSet: function checkPrice(value) {
					if (value && this.price === undefined) {
						throw new Error(`The buyable item "${this.name}" must have a price!`);
					}
					if (!value && this.price !== undefined) {
						throw new Error(`The not buyable item "${this.name}" has a price; Did you intend it to be buyable?`);
					}
				}
			}
		},
		description: {
			allowNull: true,
			type: STRING(1024)
		},
		name: {
			allowNull: false,
			type: STRING,
			unique: true
		},
		price: { type: INTEGER },
		rarity: {
			allowNull: false,
			type: ENUM,
			// Unknown, Limited, Immortal, Chaos, Harmony, Dragon Size, Ultra Rare, Rare, Uncommon, Common
			values: ['?', 'LIMITED', 'IMM', 'CH', 'HM', 'DSIZE', 'UR', 'R', 'UC', 'C']
		},
		tradable: {
			allowNull: false,
			defaultValue: false,
			type: BOOLEAN
		},
		type: {
			allowNull: false,
			type: ENUM,
			values: ['BADGE', 'ITEM']
		},
		unique: {
			allowNull: false,
			defaultValue: true,
			type: BOOLEAN
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
