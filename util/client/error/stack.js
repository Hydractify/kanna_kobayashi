const { Message } = require('discord.js');
const Command = require('../../../cogs/commands/framework');
const Raven = require('raven');
const log = require('../../log/sentry');

module.exports = async (error, message, command) =>
{	
	if (!error || !message || !command)
	{	throw new Error('The stack (clientStack) function takes 3 parameters: error, command and message');	}

	if (!(error instanceof Error)) throw new Error('The error parameter is not an instanceof Error!');
	if (!(message instanceof Message)) throw new Error('The message parameter is not an instanceof Message!');
	if (!(command instanceof Command)) throw new Error('The command parameter is not an instanceof Command!');

	await Raven.captureException(error);
	log('Sent an Error to sentry.io!');

	message.channel.send(`**An Error has occured! Please paste this on the official guild!** <:ayy:315270615844126720> http://kannathebot.me/guild\n\n\\\`${command.name}\\\`\n\\\`\\\`\\\`\n${error.stack}\n\\\`\\\`\\\``);	};