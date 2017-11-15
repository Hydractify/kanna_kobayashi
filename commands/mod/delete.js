const Command = require('../../structures/Command');

const { parseFlags } = require('../../util/util');

class DeleteMessagesCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['purge'],
			clientPermissions: ['MANAGE_MESSAGES'],
			cooldown: 5000,
			enabled: true,
			description: 'Use this command to delete messages... And maybe hide them... <:KannaISee:315264557843218432>',
			examples: ['delete 30', 'delete 20 bots', 'delete 10 wizard'],
			name: 'delete',
			usage: 'delete <Number|ID> [\'--user\' <User>|\'--bots\' <Boolean>|<\'--before\'/\'--after\'> <Message ID>|]',
			permLevel: 0
		});
	}

	run(message, [input, ...args]) {
		if (!input) {
			return message.reply('you must provide me an amount of messages or a message ID <:KannaAyy:315270615844126720>');
		}

		const match = /^\d{17,19}$/.test(input);
		const amount = parseInt(input);

		if (isNaN(amount)) return message.reply(`**${input}** is not a number`);

		if (match) return this.deleteMessage(message, input);

		if (amount > 100 || amount < 2) {
			return message.reply('you must provide me an amount higher than 2 and lower than 100!');
		}

		const flags = parseFlags(args.join(' '), true);

		switch (flags.firstKey()) {
			case 'before':
			case 'after':
				return this.queryDelete(message, amount, flags);

			case 'user':
			case 'bots':
				return this.userDelete(message, amount, flags);

			default:
				return this.deleteMessages(message, amount);
		}
	}

	async deleteMessage(message, id) {
		const messageResolved = await message.channel.fetchMessage(id).catch(() => null);
		if (!messageResolved) return message.reply(`**${id}** is not a valid Message ID!`);

		return messageResolved.delete()
			.then(() => message.reply(`I have sucessfully deleted the message with the ID **${id}**!`))
			.catch(() => message.reply(`I was not able to delete that message <:FeelsKannaMan:341054171212152832>`));
	}	

	async queryDelete(message, amount, flags) {
		const messagesResolved = await message.channel.fetchMessages({ limit: amount, [flags.firstKey()]: flags.first() });

		return message.channel.bulkDelete(messagesResolved)
			.then(messages => message.reply(`I have deleted a total of **${messages.size}** messages!`))
			.catch(() => null);
	}

	async userDelete(message, amount, flags) {
		const messagesResolved = await message.channel.fetchMessages({ limit: amount });

		const user = await this.handler.resolveUser(flags.first());

		for (const messageSent of messagesResolved.values()) {
			if (flags.firstKey() === 'user' && user && messageSent.author.id === user.id) {
				messagesResolved.delete(messageSent.id);
				continue;
			}

			if (flags.first() === 'true' && !messageSent.author.bot) {
				messagesResolved.delete(messageSent.id);
				continue;
			}

			if (messageSent.author.bot) messagesResolved.delete(messageSent.id);
		}

		return message.channel.bulkDelete(messagesResolved)
			.then(messages => message.reply(`I have sucessfully deleted **${messages.size}** messages!`))
			.catch(() => null);
	}

	async deleteMessages(message, amount) {
		const messagesResolved = await message.channel.fetchMessages({ limit: amount });

		return message.channel.bulkDelete(messagesResolved)
			.then(messages => message.reply(`I have deleted a total of **${messages.size}** messages!`))
			.catch(() => null);
	}
}

module.exports = DeleteMessagesCommand;
