const { Message } = require('discord.js');
const Command = require('../../../cogs/commands/framework');

module.exports = (e, message, cmd) =>
{	if (!e || !message || !cmd)
	{	throw new Error('clientStack takes 3 parameters: Error, Command and Message')	}
	else
	{	if (!(e instanceof Error)) throw new Error('Error Parameter isn\'t an instanceof Error');
		if (!(message instanceof Message)) throw new Error('Message parameter isn\'t an instanceof Message!');
		if (!(cmd instanceof Command)) throw new Error('Command parameter isn\'t an instanceof Command');	}

	message.channel.send(`An Error has occured! Please report this to the official guild!\n\`${cmd}\`\n\`\`\`js\n${e.stack}\n\`\`\`\n<:ayy:315270615844126720>`);	}
