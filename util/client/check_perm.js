const log = require('discord.js');

module.exports = (client, member, message) =>
{
	if (!client || !member || !message)
	{	throw new Error('checkPerm takes 3 parameters: Client, GuildMember and Message');	}
	else
	{	if (!client instanceof Discord.Client()	) throw new Error('Client isn\'t an instanceof Discord.Client()');
		if (typeof message !== 'object') throw new Error('Message must be an Object');
		if (typeof member !== 'object') throw new Error('Member must be an Object');	}

	if (member.permissions.has('MANAGE_GUILD')
		|| member.permissions.has(['BAN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_MESSAGES'])	) return 2;

	const event_role = message.guild.roles.find(role =>
	{	role.name.toLowerCase() === 'dragon tamer'	}	);

	if (event_role && message.member.role.has(event_role)	) return 1;

	return 0;	}