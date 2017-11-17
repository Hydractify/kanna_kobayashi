const Command = require('../../structures/Command');

const { parseFlags } = require('../../util/util');

class DeleteMessagesCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['purge'],
			clientPermissions: ['MANAGE_MESSAGES'],
			coins: 0,
			description: 'Use this command to delete messages... And maybe hide them... <:KannaISee:315264557843218432>',
			examples: [
				'delete 30',
				'delete 20 --bots',
				'delete 10 --user wizard',
				'delete 15 --bots --after 380985261447970816',
				'delete 10 --user wizard --before 380986424125554688'
			],
			exp: 0,
			name: 'delete',
			usage: 'delete <Number|MessageID> [\'--user\' <User>|\'--bots\'] [<\'--before\'|\'--after\'> <MessageID>]',
			permLevel: 2
		});
	}

	async run(message, [input, ...args]) {
		if (!input) {
			return message.reply(
				'you must provide me an amount of messages or a message ID to delete! <:KannaAyy:315270615844126720>'
			);
		}

		const match = /^\d{17,19}$/.test(input);
		if (match) {
			const fetched = await message.channel.fetchMessage(input).catch(() => null);
			if (!fetched) return message.reply(`**${input}** is not a valid message ID!`);

			return fetched.delete()
				.then(() => message.reply(`I sucessfully deleted the message with the ID **${input}**!`))
				.catch(() => message.reply(
					`I was not able to delete the message with the id **${input}** message! <:FeelsKannaMan:341054171212152832>`
				));
		}

		const amount = parseInt(input);
		if (isNaN(amount)) return message.reply(`**${input}** is not a number.`);


		if (amount > 100 || amount < 2) {
			return message.reply('you must provide me an amount higher than 2 and lower than 100!');
		}

		const flags = parseFlags(args.join(' '), true);
		let messages = null;

		// `before` takes priority over `after`
		const [beforeOrAfter, messageID] = this._getBeforeOrAfter(flags);
		if (beforeOrAfter) {
			if (!/^\d{17,19}$/.test(messageID)) {
				return message.reply(`The provided message id for ${beforeOrAfter} is not valid!`);
			}

			messages = await message.channel.fetchMessages({ limit: amount, [beforeOrAfter]: messageID });
		} else {
			messages = await message.channel.fetchMessages({ limit: amount });
		}

		// `user` takes priority over `bots`
		if (flags.has('user')) {
			// Member to avoid finding other users with the same name and to allow nicknames
			const member = await this.handler.resolveMember(message.guild, flags.get('user'));

			if (!member) return message.reply(`I could not find a user with ${flags.get('user')}!`);

			messages = messages.filter(m => m.author.id === member.id);
		// `bots` takes priority over `users`
		} else if (flags.has('bots') || flags.has('users')) {
			const bots = flags.has('bots');
			messages = messages.filter(m => m.author.bot === bots);
		}

		if (message.size < 2) return message.reply('I could not find enough messages to delete!');

		return message.channel.bulkDelete(messages, true)
			.then(deleted => message.reply(`I sucessfully deleted **${deleted.size}** messages!`))
			.catch(() => message.reply(
				'something went wrong while deleting your messages, they might be older than 14 days.'
			));
	}

	/**
	 * Get tuple of the before or after flag and message id from flags collection,
	 * or tuple of null and null if no appropriate flag is present.
	 * @param {Collection<string, string>} flags Flags to read from
	 * @returns {[?string, ?string]} Target type and id or null if none
	 */
	_getBeforeOrAfter(flags) {
		if (flags.has('before')) return ['before', flags.get('before')];
		if (flags.has('after')) return ['after', flags.get('after')];

		return [null, null];
	}
}

module.exports = DeleteMessagesCommand;
