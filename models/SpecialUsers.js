/* eslint-disable new-cap */

const { STRING, ENUM } = require('sequelize');

const { db } = require('../structures/PostgreSQL');

const SpecialUser = db.define('special_users', {
	id: {
		primaryKey: true,
		type: STRING('20')
	},
	type: {
		allowNull: false,
		type: ENUM,
		values: ['BLACKLISTED', 'WHITELISTED', 'TRUSTED', 'DEV']
	}
});

module.exports = SpecialUser;
