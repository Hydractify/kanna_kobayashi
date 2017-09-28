/* eslint-disable new-cap */

const { BOOLEAN, DATE, ENUM, INTEGER, Model, STRING, JSONB } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

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
		type: STRING('20'),
		set: function setPartnerId(value) {
			this.setDataValue('partnerId', value);
			this.setDataValue('partnerSince', value ? new Date() : null);
			this.setDataValue('partnerMarried', value ? false : null);
		}
	},
	partnerSince: { type: DATE },
	partnerMarried: { type: BOOLEAN }
}, {
	tableName: 'users',
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
	sequelize: db
});

// TODO: Verify this actually works
User.hasOne(User, { as: 'partner', foreignKey: 'partnerId' });

module.exports = User;
