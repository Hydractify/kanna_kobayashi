const { Message } = require('discord.js');
const Command = require('../../../cogs/commands/framework');

module.exports = (p, message, cmd) =>
{	if (!p || !message || !cmd)
	{	throw new Error('clientPerm takes 3 parameters: Permission, Message and Command')	}
	else
		// Sure this is correct? cmd does not look like a class instance nor Command.name not like a constructor.
	{	if (!cmd instanceof Command.name) throw new Error('Command parameter isn\'t an instanceof Command')
		if (!(message instanceof Message)) throw new Error('message parameter isn\'t instanceof Message!');
		if (typeof p !== 'string') throw new Error('Permission must be a String');	}

	message.channel.send(`Couldn\'t execute ${cmd} because of the lack of \`${p}\` permission <:ayy:315270615844126720>`);	}