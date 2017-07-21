const { Message } = require('discord.js');
const Command = require('../../../cogs/commands/framework');

module.exports = (error, message, command) =>
{	
	if (!error || !message || !command)
	{	throw new Error('The stack (clientStack) function takes 3 parameters: error, command and message');	}

	if (!(error instanceof Error)) throw new Error('The error parameter is not an instanceof Error!');
	if (!(message instanceof Message)) throw new Error('The message parameter is not an instanceof Message!');
	if (!(command instanceof Command)) throw new Error('The command parameter is not an instanceof Command!');

	message.channel.send(`**An Error has occured! Please paste this on the official guild!** <:ayy:315270615844126720> http://kannathebot.me/guild\n\n\\\`${command.name}\\\`\n\\\`\\\`\\\`\n${error.stack}\n\\\`\\\`\\\``);	};
