const { Message } = require('discord.js');
const Command = require('../../../cogs/commands/framework');

module.exports = (permission, message, cmd) =>
{	
	if (!permission || !message || !cmd)
	{	throw new Error('The perm (clientPerm) function takes 3 parameters: permission, message and command!');	}
	
	if (!(cmd instanceof Command)) throw new Error('The command parameter is not an instanceof Command!');
	if (!(message instanceof Message)) throw new Error('The message parameter is not an instanceof Message!');
	if (typeof permission !== 'string') throw new Error('The permission must be a string!');

	message.channel.send(`Couldn't execute ${cmd.name} because of the lack of \`${permission}\` permission <:ayy:315270615844126720>`);	};
