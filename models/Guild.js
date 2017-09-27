/* eslint-disable new-cap */

const { ARRAY, JSONB, STRING } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

const Guild = db.define('guilds', {
	id: {
		primaryKey: true,
		type: STRING('20')
	},
	prefixes: {
		type: ARRAY(STRING),
		defaultValue: []
	},
	tamerRole: {
		type: STRING,
		set: function setTamerRole(value) { return this.setDataValue('tamerRole', value.toLowerCase()); }
	},
	quiz: {
		// TODO: Maybe move this to a seperate table with a 1:1 or 1:m relationship?
		type: JSONB,
		defaultValue: {
			character: 'http://pm1.narvii.com/6366/2c35594538206f7f598be792bf203b6b638e9c07_hq.jpg',
			answer: 'kanna kobayashi'
		}
	},
	notifications: {
		// TODO: Same here?
		type: JSONB,
		defaultValue: {
			levelUp: true,
			welcome: {
				enabled: false,
				channel: null
			}
		}
	},
	roles: {
		type: ARRAY(STRING),
		defaultValue: []
	}
});

module.exports = Guild;
