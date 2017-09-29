/* eslint-disable new-cap */

const { BOOLEAN, DATE, ENUM, INTEGER, Model, STRING, JSONB } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');
const CommandLog = require('./CommandLog');

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
	items: {
		// TODO: Most likely a new table with a 1:m / m:m relationship
		type: JSONB,
		defaultValue: []
	},
	badges: {
		// TODO: Same here
		type: JSONB,
		defaultValue: []
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

module.exports = User;
