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
			usage: 'delete <Number|ID> [\'--user\' <User>|\'--bots\'|<\'--before\'/\'--after\'> <Message ID>|]',
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

			case 'first':
			case 'bots':
				return this.userDelete(message, amount, flags);

			default:
				return this.deleteMessages(message, amount);
		}
	}

	async deleteMessage(message, id) {
		const messageResolved = await this.handler.resolveMessage(message.channel, id);
		if (!messageResolved) return message.reply(`**${id}** is not a valid Message ID!`);

		return messageResolved.delete()
			.then(() => message.reply(`I have sucessfully deleted the message with the ID **${id}**!`))
			.catch(() => message.reply(`I was not able to delete that message <:FeelsKannaMan:341054171212152832>`));
	}

	async queryDelete(message, amount, flags) {
		const messagesResolved = await this.handler.resolveMessages(message.channel, amount, [flags.firstKey(), flags.first()]);

		return message.channel.bulkDelete(messagesResolved)
			.then(messages => message.reply(`I have deleted a total of **${messages.size}** messages!`))
			.catch(() => null);
	}

	async userDelete(message, amount, flags) {
		const messagesResolved = await this.handler.resolvedMessages(message.channel, amount);
	}

	async deleteMessages(message, amount) {
		const messagesResolved = await this.handler.resolveMessages(message.channel, amount);

		return message.channel.bulkDelete(messagesResolved)
			.then(messages => message.reply(`I have deleted a total of **${messages.size}** messages!`))
			.catch(() => null);
	}
}

module.exports = DeleteMessagesCommand;
