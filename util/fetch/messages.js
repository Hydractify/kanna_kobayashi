const { Message } = require('discord.js');
const log = require('../log/error');

module.exports = (message) =>
{
	if (!message) throw new Error('The messages (fetchMessages) function takes 1 parameter: message!');
	if (!(message instanceof Message)) throw new Error('The message parameter is not instanceof Message!');

	return message.channel.fetchMessages()
		.catch(error => log(error));	};
