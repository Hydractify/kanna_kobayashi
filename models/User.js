/* eslint-disable new-cap */

const { ENUM, INTEGER, STRING, JSONB } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

const User = db.define('users', {
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
	relationship: {
		// TODO: No clue what this is for, perhaps something that can make use of a new table?
		type: STRING,
		defaultValue: null
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
});

Reflect.defineProperty(
	User.prototype,
	'level',
	{
		get: function getLevel() {
			return Math.floor(Math.sqrt(this.exp / 1000)) + 1;
		}
	}
);

module.exports = User;
