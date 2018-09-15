import { Collection, GuildMember, Message, Snowflake } from 'discord.js';

import { User as UserModel } from '../models/User';
import { Emojis } from '../types/Emojis';
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
	 *
	 * The command's action
	 */
	protected action: string;
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
		action: string;
		emoji: string;
		type: string;
	}) {
		if (options.clientPermissions) options.clientPermissions.push('EMBED_LINKS');
		else options.clientPermissions = ['EMBED_LINKS'];

		super(handler, options);

		this.action = options.action;
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
		if (!args.length) return `you must mention someone ${Emojis.KannaShy}`;

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
		action: string = this.action,
	): string {
		let base: string = `${this.emoji} | `;

		if (members.size === 1) return `${base}**${message.member.displayName}** ${action} **${members.first().name}**`;

		base += `**${message.member.displayName}** ${action}`;
		const names: string[] = members.map((member: IWeebResolvedMember) => member.name);

		// TODO: Make 'me' and 'themself' be the last index
		base += ` **${names.slice(0, -1).join('**, **')}** and **${names[names.length - 1]}**`;

		return base;
	}

	/**
	 * Fetch an embed with an image of the type of the class.
	 */
	protected async fetchEmbed(
		message: Message,
		model: UserModel,
		members: Collection<string, IWeebResolvedMember>,
		{ dev, trusted, bot }: IWeebResponseTemplates,
	): Promise<MessageEmbed> {
		const { url }: RandomImageResult = await fetchRandom({
			filetype: 'gif',
			nsfw: false,
			type: this.type,
		});

		const embed: MessageEmbed = MessageEmbed.image(
			message,
			model,
			url,
		);

		if (members && members.size === 1) {
			const { member, perm }: IWeebResolvedMember = members.first();

			if (dev && perm === PermLevels.DEV) {
				embed.setDescription(dev);
			} else if (trusted && perm === PermLevels.TRUSTED) {
				embed.setDescription(trusted);
			} else if (bot && message.client.user.id === member.id) {
				embed.setDescription(bot);
			}
		}

		embed.footer.text += ' | Powered by weeb.sh';

		return embed;
	}

	/**
	 * Resolves mentioned members in a specific way.
	 */
	protected async resolveMembers(input: string[], { author, guild }: Message)
		: Promise<Collection<Snowflake, IWeebResolvedMember>> {
		const resolved: Collection<Snowflake, IWeebResolvedMember> = new Collection<Snowflake, IWeebResolvedMember>();

		for (const word of input) {
			// Ignore 2 or 1 char long "names"
			if (word.length < 3) continue;

			const member: GuildMember = await this.resolver.resolveMember(word, guild);
			if (!member) continue;

			const userModel: UserModel = await member.user.fetchModel();

			// A bit ugly, neither case nor if else if would be much better though.
			const name: string =
				member.id === author.id
					? 'themself'
					: member.id === this.client.user.id
						? 'me'
						: WeebCommand.mentionRegex.test(word)
							? member.displayName
							: member.toString();

			resolved.set(member.id, {
				member,
				name,
				partnerId: userModel.partnerId,
				perm: userModel.permLevel(member),
			});
		}

		return resolved;
	}
}
