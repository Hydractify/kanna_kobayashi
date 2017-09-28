/* eslint-disable new-cap */

const { ENUM, INTEGER, Model, STRING, JSONB } = require('sequelize');

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
	}
}, { sequelize: db });

// TODO: Verify this actually works
User.hasOne(User, { as: 'partner', foreignKey: 'partner_id' });

module.exports = User;
