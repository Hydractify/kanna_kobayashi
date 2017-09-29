/* eslint-disable new-cap */

const { BOOLEAN, DATE, ENUM, INTEGER, Model, STRING } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');
const CommandLog = require('./CommandLog');
const Item = require('./Item');

class User extends Model {
	get level() {
		return Math.floor(Math.sqrt(this.exp / 1000)) + 1;
	}
}

User.init({
	id: {
		primaryKey: true,
		type: STRING('20')
	},
	coins: {
		allowNull: false,
		defaultValue: 0,
		type: INTEGER
	},
	exp: {
		allowNull: false,
		defaultValue: 0,
		type: INTEGER
	},
	type: {
		type: ENUM,
		values: ['BLACKLISTED', 'WHITELISTED', 'TRUSTED', 'DEV']
	},
	partnerId: {
		field: 'partner_id',
		type: STRING('20')
	},
	partnerSince: {
		field: 'partner_since',
		type: DATE
	},
	partnerMarried: {
		field: 'partner_married',
		type: BOOLEAN
	}
}, {
	createdAt: false,
	hooks: {
		beforeUpdate: user => {
			// Partner present?
			if (user.partnerId) {
				// But no since date? (newly added)
				if (!user.partnerSince) {
					user.partnerSince = new Date();
				}
			} else {
				// No partner but a since date? (just deleted)
				if (user.partnerSince) {
					user.partnerSince = null;
				}
				// Married without a partner? (^)
				if (user.partnerMarried !== null) {
					user.partnerMarried = null;
				}
			}
		}
	},
	sequelize: db,
	tableName: 'users',
	updatedAt: false
});

// TODO: Verify this actually works
User.hasOne(User, { as: 'partner', foreignKey: 'partnerId' });
User.hasMany(CommandLog, { foreignKey: 'user_id' });
User.belongsToMany(Item, {
	as: 'items',
	otherKey: 'item_id',
	through: 'user_items',
	foreignKey: 'user_id',
	scope: { type: 'ITEM' }
});
User.belongsToMany(Item, {
	as: 'badges',
	otherKey: 'item_id',
	through: 'user_items',
	foreignKey: 'user_id',
	scope: { type: 'BADGE' }
});
Item.belongsToMany(User, { as: 'holders', otherKey: 'user_id', through: 'user_items', foreignKey: 'item_id' });

module.exports = User;
