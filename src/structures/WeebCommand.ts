import { Collection, GuildMember, Message, Snowflake } from 'discord.js';

import { User as UserModel } from '../models/User';
import { ICommandInfo } from '../types/ICommandInfo';
import { PermLevels } from '../types/PermLevels';
import { IWeebResolvedMember } from '../types/weeb/IWeebResolvedMember';
import { IWeebResponseTemplates } from '../types/weeb/IWeebResponseTemplate';
import { RandomImageResult } from '../types/weeb/RandomImageResult';
import { Command } from './Command';
import { CommandHandler } from './CommandHandler';
import { MessageEmbed } from './MessageEmbed';
import { fetchRandom } from './weeb';

/**
 * Abstract WeebCommand class to provide Weeb.sh functionality for commands in an easy manner.
 */
export abstract class WeebCommand extends Command {
	/**
	 * Regex to validate whether a member was mentioned
	 */
	protected static readonly mentionRegex: RegExp = /^<@!?\d{17,19}>$/;

	/**
	 * Emoji used in the base string
	 */
	protected readonly emoji: string;
	/**
	 * Type of images the command is using
	 */
	protected readonly type: string;

	/**
	 * Derive from WeebCommand.
	 */
	public constructor(handler: CommandHandler, options: ICommandInfo & {
		emoji: string;
		type: string;
	}) {
		super(handler, options);

		this.emoji = options.emoji;
		this.type = options.type;
	}

	/**
	 * Default args validating and parsing, may be overriden.
	 *
	 * @virtual
	 */
	public async parseArgs(
		message: Message,
		args: string[],
	): Promise<string | [Collection<Snowflake, IWeebResolvedMember>]> {
		if (!args.length) return 'you must meantion someone <:KannaAyy:315270615844126720>';

		const members: Collection<Snowflake, IWeebResolvedMember> = await this.resolveMembers(args, message);
		if (!members.size) return `I could not find anyone with ${args.join(' ')}`;

		return [members];
	}

	/**
	 * Compute the base string used in the reponse embed
	 */
	protected computeBaseString(
		message: Message,
		members: Collection<string, IWeebResolvedMember>,
		{ action, dev, trusted, bot }: IWeebResponseTemplates,
	): string {
		let base: string = `${this.emoji} | `;

		if (members.size === 1) {
			const { name, member, perm }: IWeebResolvedMember = members.first();

			if (message.author.id === member.id) {
				base = `${base}**${message.member.displayName}** ${action} **${name}**`;
			} else if (dev && perm === PermLevels.DEV) {
				base += dev;
			} else if (trusted && perm === PermLevels.TRUSTED) {
				base += trusted;
			} else if (bot && message.client.user.id === member.id) {
				base += bot;
			} else {
				base = `${base}**${message.member.displayName}** ${action} **${name}**`;
			}

			return base;
		}

		base += `**${message.member.displayName}** ${action}`;
		const names: string[] = members.map((member: IWeebResolvedMember) => member.name);

		base += `**${names.slice(0, -1).join('**,')} and **${names[names.length - 1]}**`;

		return base;
	}

	/**
	 * Fetch an embed with an image of the type of the class.
	 */
	protected async fetchEmbed(message: Message, model: UserModel): Promise<MessageEmbed> {
		const { url }: RandomImageResult = await fetchRandom({
			type: this.type,
			nsfw: false,
			fileType: 'gif',
		});

		const embed: MessageEmbed = MessageEmbed.image(
			message,
			model,
			url,
		);

		embed.footer.text += ' | Powered by weeb.sh';

		return embed;
	}

	/**
	 * Resolves mentioned members in a specific way.
	 */
	protected async resolveMembers(input: string[], { author, guild }: Message)
		: Promise<Collection<Snowflake, IWeebResolvedMember>> {
		const resolved: Collection<Snowflake, IWeebResolvedMember> = new Collection<Snowflake, IWeebResolvedMember>();
		const promises: Promise<void>[] = [];

		for (const word of input) {
			// Ignore 2 or 1 char long "names"
			if (word.length < 3) continue;

			const promise: Promise<void> = this.resolver.resolveMember(word, guild)
				.then(async (member: GuildMember) => {
					const { partnerId, permLevel }: UserModel = await member.user.fetchModel();

					// A bit ugly, neither case nor if else if would be much better though.
					const name: string =
						member.id === author.id
							? 'himself'
							: member.id === this.client.user.id
								? 'me'
								: WeebCommand.mentionRegex.test(word)
									? member.displayName
									: member.toString();

					resolved.set(member.id, {
						member,
						name,
						partnerId,
						perm: permLevel(member),
					});
				})
				.catch(() => undefined);

			promises.push(promise);
		}

		await Promise.all(promises);

		return resolved;
	}
}
