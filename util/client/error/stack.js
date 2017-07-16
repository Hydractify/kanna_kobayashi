const Command = require('../../../cogs/commands/framework');

module.exports = (e, message, cmd) =>
{	if (!e || !message || !cmd)
	{	throw new Error('clientStack takes 3 parameters: Error, Command and Message')	}
	else
	{	if (!e instanceof Error) throw new Error('Error Parameter isn\'t an instaceof Error');
		if (typeof message !== 'object') throw new Error('Message must be an Object');
		if (!cmd instanceof Command.name) throw new Error('Command parameter isn\'t an instanceof Command');	}
	
	message.channel.send(`An Error has occured! Please report this to the official guild!\n\`${cmd}\`\n\`\`\`js\n${e.stack}\n\`\`\`\n<:ayy:315270615844126720>`);	}