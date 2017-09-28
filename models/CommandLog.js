/* eslint-disable new-cap */

const { DATE, STRING } = require('sequelize');

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
		field: 'last_used',
		type: DATE,
		get: function getLastUsed() {
			return this.getDataValue('lastUsed') || new Date(0);
		}
	}
});

module.exports = CommandLog;
