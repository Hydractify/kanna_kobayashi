const { Message } = require('discord.js');

module.exports = (user, message) =>
{
	if (!user || !message)
	{	throw new Error('The fetch (error) function takes 2 parameters: user and message!');  }

	if (!(message instanceof Message)) throw new Error('The message parameter is not instanceof Message!');
	if (typeof user !== 'string') throw new Error('The user parameter is not a string!');

	message.channel.send(`I couldn't find anything matching **${user}** <:ayy:315270615844126720>`);	};
