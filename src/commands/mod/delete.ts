import { Collection, GuildMember, Message, Snowflake } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';
import { FlagCollection, parseFlags } from '../../util/Util';

class DeleteMessagesCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['purge', 'del'],
			clientPermissions: ['MANAGE_MESSAGES'],
			coins: 0,
			description: 'Use this command to delete messages... Maybe to hide them... <:KannaISee:315264557843218432>',
			examples: [
				'delete 30',
				'delete 20 --bots',
				'delete 10 --user wizard',
				'delete 15 --bots --after 380985261447970816',
				'delete 10 --user wizard --before 380986424125554688',
			],
			exp: 0,
			name: 'delete',
			usage: 'delete <Number|MessageID> [\'--user\' <User>|\'--bots\'] [<\'--before\'|\'--after\'> <MessageID>]',
			permLevel: PermLevels.HUMANTAMER,
		});
	}

	public async parseArgs(
		message: Message,
		[first, ...args]: string[],
	): Promise<string | [Message] | [Collection<Snowflake, Message>]> {
		if (!first) {
			return 'you must provide me an amount of messages or a message ID to delete! <:KannaAyy:315270615844126720>';
		}

		const match: boolean = /^\d{17,19}$/.test(first);
		if (match) {
			const fetched: Message = await message.channel.messages.fetch(first);
			if (!fetched) return `**${first}** is not a valid message ID!`;

			return [fetched];
		}

		const amount: number = parseInt(first);
		if (isNaN(amount)) return `**${first}** is not a number!`;

		if (amount > 100 || amount < 2) {
			return 'you must provide me an amount higher than 2 and lower than 100!';
		}

		const flags: FlagCollection = parseFlags(args.join(' '), true);
		let messages: Collection<Snowflake, Message>;

		const [beforeOrAfter, messageId]: [string, string] = this._getBeforeOrAfter(flags);
		if (beforeOrAfter) {
			if (!/^\d{17,19}$/.test(messageId)) {
				return `The provided message id for ${beforeOrAfter} is not valid!`;
			}

			messages = await message.channel.messages.fetch({ limit: amount, [beforeOrAfter]: messageId });
		} else {
			messages = await message.channel.messages.fetch({ limit: amount });
		}

		if (flags.has('user')) {
			const member: GuildMember = await this.resolver.resolveMember(flags.get('user') as string, message.guild);

			if (!member) return `I could not find a user with ${flags.get('user')}`;

			messages = messages.filter((msg: Message) => msg.author.id === member.id);
		} else if (flags.has('bots') || flags.has('users')) {
			const bots: boolean = Boolean(flags.get('bots'));
			messages = messages.filter((msg: Message) => msg.author.bot === bots);
		}

		return [messages];
	}

	public async run(
		message: Message,
		[toDelete]: [Message] | [Collection<Snowflake, Message>]
	): Promise<Message | Message[]> {
		if (toDelete instanceof Message) {
			return toDelete.delete()
				.then(() => message.reply(`I sucessfully deleted the message with the ID **${toDelete.id}**!`))
				.catch(() => message.reply(
					`I was not able to delete the message with the id **${toDelete.id}** message! <:FeelsKannaMan:341054171212152832>`
				));
		}

		return message.channel.bulkDelete(toDelete, true)
			.then((deleted: Collection<Snowflake, Message>) =>
				message.reply(`I sucessfully deleted **${deleted.size}** messages!`),
		)
			.catch(() =>
				message.reply('something went wrong while deleting your messages, they might be older than 14 days.'),
		);
	}

	/**
	 * Get tuple of the before or after flag and message id from flags collection,
	 * or tuple of null and null if no appropriate flag is present.
	 * @param flags Flags to read from
	 * @returns Target type and id or null if none
	 */
	private _getBeforeOrAfter(flags: FlagCollection): [string, string] {
		if (flags.has('before')) return ['before', flags.get('before') as string];
		if (flags.has('after')) return ['after', flags.get('after') as string];

		return [undefined, undefined];
	}
}

export { DeleteMessagesCommand as Command };
