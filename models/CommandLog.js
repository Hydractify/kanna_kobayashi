/* eslint-disable new-cap */

const { DATE, NOW, STRING } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

const CommandLog = db.define('command_log', {
	userId: {
		field: 'user_id',
		primaryKey: true,
		type: STRING(20)
	},
	command: {
		primaryKey: true,
		type: STRING
	},
	lastUsed: {
		allowNull: false,
		field: 'last_used',
		default: NOW,
		type: DATE
	}
});

module.exports = CommandLog;
