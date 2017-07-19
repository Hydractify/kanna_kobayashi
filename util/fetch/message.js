const { Message } = require('discord.js');
const log = require('../client/error/fetch');

module.exports = (id, message) =>
{	
	if (!id || !message)
	{	throw new Error('The message (fetchMessage) function takes 2 paremeters: ID and Message!');	}

	if (typeof id !== 'string') throw new Error('The id parameter ist not a string!');
	if (!(message instanceof Message)) throw new Error('The message parameter is not instanceof Message!');

	return message.channel.fetchMessage(id)
		.catch(() =>	log(id, message));	};
