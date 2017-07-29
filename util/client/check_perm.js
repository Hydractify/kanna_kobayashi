const { Client, GuildMember, Message } = require('discord.js');
const { client } = require('../../cogs/connections/discord');

module.exports = (member, message) =>
{
	if (!member || !message)
	{	throw new Error('The check_perm function takes 3 parameters: client, member and message');	}

	if (!(client instanceof Client)) throw new Error('The client parameter is not instanceof Client!');
	if (!(member instanceof GuildMember)) throw new Error('The member parameter is not instanceof GuildMember!');
	if (!(message instanceof Message)) throw new Error('The message parameter is not instanceof Message!');

	if (member.permissions.has('MANAGE_GUILD')
		|| member.permissions.has(['BAN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_MESSAGES'])) return 2;

	const eventRole = message.guild.roles.find(role => role.name.toLowerCase() === 'dragon tamer');

	if (eventRole && member.roles.has(eventRole)) return 1;

	return 0;	};
