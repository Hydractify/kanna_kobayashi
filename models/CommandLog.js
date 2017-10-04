/* eslint-disable new-cap */

const { STRING, Model } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

class CommandLog extends Model { }

CommandLog.init(
	{
		userId: {
			allowNull: false,
			field: 'user_id',
			type: STRING(20)
		},
		commandName: {
			allowNull: false,
			field: 'command_name',
			type: STRING
		}
	},
	{
		createdAt: 'run',
		tableName: 'command_logs',
		sequelize: db,
		updatedAt: false
	}
);

module.exports = CommandLog;
