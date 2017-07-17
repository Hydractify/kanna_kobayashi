const { Message } = require('discord.js');

module.exports = (user, message) =>
{
	if(!user || !message) // Check if the parameters exist
	{	throw new Error('Fetch error takes two parameters, User and Message');  }
	else
	{	if(!(message instanceof Message)) throw new Error('message parameter isn\'t instanceof Message!');
		if(typeof user !== 'string') throw new Error('User must be a string');  }

	message.channel.send(`I couldn't find anything matching **${user}** <:ayy:315270615844126720>`);	} // Pretty obvious am i rite