const { Client, GuildMember, Message } = require('discord.js');
const log = require('../client/error/fetch');

const resolveMember = (message, [input]) => {
	if (message.mentions.members.size) return message.mentions.members.first();

	// if uncached
	if (message.mentions.users.size) return message.mentions.users.first().id;

	// wew, whether input is in someones tag
	let resolved = message.guild.members.find(member => member.user.tag.toLowerCase().includes(input.toLowerCase()));
	if (resolved) return resolved;

	// wew the second, whether the input is in someone's displayname
	resolved = message.guild.members.find(member => member.displayName.toLowerCase().includes(input.toLowerCase()));
	if (resolved) return resolved;

	return input;
};

module.exports = (client, message, args) =>
{	
	if (!client || !message || !args)
	{	throw new Error('The member (fetchMember) function takes 3 parameters: client, message and args!');	}

	if (!(client instanceof Client)) throw new Error('The client parameter is not instanceof Client!');
	if (!(message instanceof Message)) throw new Error('The message parameter is not instanceof Message!');
	if (!(args instanceof Array)) throw new Error('The args parameter is not instanceof Array!');

	const resolved = resolveMember(message, args);
	if (resolved instanceof GuildMember) return resolved;

	return message.guild.fetchMember(resolveMember(message, args))
		.catch(() => log(args[0], message));	};
