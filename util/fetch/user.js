const { Client, Message, User } = require('discord.js');
const log = require('../client/error/fetch');

const resolveUser = (message, [input]) => {
	if (message.mentions.users.size) return message.mentions.users.first();

	let resolved = message.guild.members.find(member => member.user.tag.toLowerCase().includes(input.toLowerCase()));
	if (resolved) return resolved.user;

	resolved = message.guild.members.find(member => member.displayName.toLowerCase().includes(input.toLowerCase()));
	if (resolved) return resolved.user;

	return input;
};

module.exports = (client, message, args) =>
{
	if (!client || !message || !args)
	{	throw new Error('The user (fetchUser) function takes 3 parameters: client, message and args!');	}

	if (!(client instanceof Client)) throw new Error('The client parameter is not instance of Client!');
	if (!(message instanceof Message)) throw new Error('The message parameter is not instanceof Message!');
	if (!(args instanceof Array)) throw new Error('The args parameter is not instanceof Array!');

	const resolved = resolveUser(message, args);
	if (resolved instanceof User) return resolved;

	return client.fetchUser(resolved)
		.catch(() => log(resolved, message));	};
