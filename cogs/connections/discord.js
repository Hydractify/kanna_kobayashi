const Discord = require('discord.js');
const log = require('../../util/log/bot');
const beta = require('../../data/client/beta');
//const official = require('../../data/client/official');

module.exports = class Discord_JS
{	static start()
	{	const Client = new Discord.Client();
		Client.login(beta.token);
		log('Connected to Discord!');
		Client.on('ready', () =>
		{	log(`Connected as ${Client.user.tag} (${Client.user.id}) at ${require('moment')().format('HH:mm')} [${require('moment')().format('DD/MM/YYYY')}]`)
			require('./rethinkdb').start();
			require('./apis/dbl').start();
			require('./apis/dbots').start();
			require('../client/event_handler').start();	});
		Client.commands = new Discord.Collection();
		Client.aliases = new Discord.Collection();
		Discord_JS._client = Client;	}
	
	static get client()
	{	if(!Discord_JS._client)
		{	throw new Error('Couldn\'t find Client')	}
		return Discord_JS._client;	}	}