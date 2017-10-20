const { Util: { escapeMarkdown } } = require('discord.js');

const Command = require('../../structures/Command');

class DiscriminatorCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['discrim'],
			coins: 0,
			description: 'Searches for user with a certain discriminator',
			examples: ['discrim 0001'],
			name: 'discriminator',
			usage: 'discriminator <Discriminator>',
			permLevel: 0
		});
	}

	async run(message, [discrim]) {
		if (!discrim) return message.reply('you have to tell me a discriminator!');
		// Will happen, sure of it
		if (discrim[0] === '#') discrim = discrim.slice(1);
		if (discrim === '0000') return message.reply('`0000` is not a valid disriminator!');
		if (!/^\d{4}$/.test(discrim)) {
			return message.channel.send([
				`That is not a valid discriminator, ${message.author}!`,
				'A valid discriminator must be a sequenze of 4 numbers but not `0000`.'
			]);
		}

		const users = await this.client.shard
			.broadcastEval(`this.commandHandler.commands.get('discriminator').filterAndMap('${discrim}');`)
			.then(res => [...new Set([].concat(...res))]);

		if (!users.length) {
			return message.reply(
				`I could not find any users with the \`${discrim}\` discriminator.`
			);
		}

		const response = `I found the following users with the discriminator \`${discrim}\`:\n`;

		// 1998 instead of 2000 because of the ", " of each user
		const totalChars = 1998 - response.length;
		let usersString = '';
		for (let user of users) {
			// People love to have markdown chars in their names
			user = escapeMarkdown(user);
			if (usersString.length + user.length >= totalChars) break;
			usersString += `, ${user}`;
		}

		// TODO: Make it user friendly
		return message.channel.send(response + usersString.slice(2));
	}

	filterAndMap(discriminator) {
		const users = [];
		for (const user of this.client.users.values()) {
			if (user.discriminator === discriminator) {
				users.push(user.username);
			}
		}

		return users;
	}
}

module.exports = DiscriminatorCommand;
