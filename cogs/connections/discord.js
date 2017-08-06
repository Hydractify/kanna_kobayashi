const Discord = require('discord.js');
const log = require('../../util/log/bot');
const beta = require('../../data/client/beta');
//const official = require('../../data/client/official');

module.exports = class Discord_JS {
	static start() {
		const Client = new Discord.Client({ disableEveryone : true });
		Client.login(beta.token);
		log('Connected to Discord!');
		Client.on('ready', async () => {
			if(!Client.user.presence.game) {
				Client.user.setGame('k!help');
			}
			log(`Connected as ${Client.user.tag} (${Client.user.id}) at ${require('moment')().format('HH:mm \\[DD/MM/YYYY\\]')}`);
			require('./apis/dbl').start();
			require('./apis/dbots').start();
			require('../client/perm_level').start();
			require('../commands/command_cache').start();
			require('../client/event_handler').start();
			require('../client/reload').start();
			require('./sentry').start();
		});
			Discord_JS._client = Client;
	}

	static get client() {
		if(!Discord_JS._client) {
			throw new Error('Couldn\'t find Client')
		}
		return Discord_JS._client;
	}
}
