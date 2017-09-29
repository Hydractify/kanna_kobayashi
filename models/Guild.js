/* eslint-disable new-cap */

const { ARRAY, BOOLEAN, STRING } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

const Guild = db.define('guilds', {
	id: {
		primaryKey: true,
		type: STRING('20')
	},
	prefixes: {
		type: ARRAY(STRING),
		defaultValue: [],
		set: function setPrefixes(value) {
			this.setDataValue('prefixes', value.map(prefix => prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')));
		}
	},
	tamerRole: {
		field: 'tamer_role',
		type: STRING,
		set: function setTamerRole(value) {
			return this.setDataValue('tamerRole', value.toLowerCase());
		}
	},
	quizAnswer: {
		field: 'quiz_anaswer',
		type: STRING,
		defaultValue: 'kanna kobayashi'
	},
	quizCharacter: {
		field: 'quiz_character',
		type: STRING,
		defaultValue: 'http://pm1.narvii.com/6366/2c35594538206f7f598be792bf203b6b638e9c07_hq.jpg'
	},
	levelUpEnabled: {
		field: 'level_up_enabled',
		type: BOOLEAN,
		defaultValue: true
	},
	welcomeChannel: {
		field: 'welcome_channel',
		type: STRING('20')
	},
	welcomeMessage: {
		field: 'welcome_message',
		type: STRING('1500')
	},
	selfRoles: {
		field: 'self_roles',
		type: ARRAY(STRING),
		defaultValue: []
	}
}, {
	createdAt: false,
	updatedAt: false
});

module.exports = Guild;
