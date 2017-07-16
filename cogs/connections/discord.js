const Discord = require('discord.js');
const log = require('../../util/log/bot');
const beta = require('../../data/client/beta');
//const official = require('../../data/client/official');

module.exports = class Discord_JS
{	static async start()
	{	const Client = new Discord.Client();
		await Client.login(beta.token);
		log(`Connected to Discord as ${Client.user.tag} (${Client.user.id}) at ${require('moment')().format('HH:mm')} [${require('moment')().format('DD/MM/YYYY')}]`);
		Discord_JS._client = Client;	}
	
	static get client()
	{	if(!Discord_JS._client)
		{	throw new Error('Couldn\'t find Client')	}
		return Discord_JS._client;	}	}