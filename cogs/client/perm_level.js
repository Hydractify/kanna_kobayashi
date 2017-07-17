exports.start = () =>
{	const { client } = require('../connections/discord');
	const info = require('../../data/client/info');
	client.perms = (message) =>
	{	if (info.devs.includes(message.author.id)) return 4;
		if(info.trusted.includes(message.author.id)) return 3;
		if(message.channel.permissionsFor(message.member).has('MANAGE_GUILD')
		|| message.channel.permissionsFor(message.member).has(['BAN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_MESSAGES']));
		const dragonTamer = message.guild.roles.find(role => role.name.toLowerCase() === 'dragon tamer');
		if (dragonTamer && message.member.roles.has(dragonTamer)) return 1;
  		return 0;	}	}