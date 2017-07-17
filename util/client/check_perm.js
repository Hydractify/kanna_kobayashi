const { Client, GuildMember, Message, } = require('discord.js');

module.exports = (client, member, message) =>
{
	if (!client || !member || !message)
	{	throw new Error('checkPerm takes 3 parameters: Client, GuildMember and Message');	}
	else
	{	if (!(client instanceof Client)) throw new Error('client parameter isn\'t instanceof Client!');
		if (!(member instanceof GuildMember)) throw new Error('member isn\'t instanceof GuildMember!');
		if (!(message instanceof Message)) throw new Error('message parameter isn\'t instanceof Message!');	}

	if (member.permissions.has('MANAGE_GUILD')
		|| member.permissions.has(['BAN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_MESSAGES'])	) return 2;

	const event_role = message.guild.roles.find(role =>
	{	role.name.toLowerCase() === 'dragon tamer'	}	);

	if (event_role && message.member.role.has(event_role)	) return 1;

	return 0;	}