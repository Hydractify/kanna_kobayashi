import {
	Collection,
	CollectorFilter,
	DiscordAPIError,
	Message,
	MessageReaction,
	ReactionCollector,
	User,
} from 'discord.js';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';
import { titleCase } from '../../util/Util';

class HelpCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['halp', 'commands'],
			clientPermissions: ['ADD_REACTIONS', 'EMBED_LINKS'],
			coins: 0,
			cooldown: 10000,
			description: [
				'See all the commands (or a specifc one) Kanna has!',
				'_PS: Use the arrow reactions to scroll through categories_',
			].join('\n'),
			examples: ['help ping', 'help'],
			name: 'help',
			permLevel: 0,
			usage: 'help [Command|Category]',
		});
	}

	public run(message: Message, [name]: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[] | void> {
		if (name) name = name.toLowerCase();

		if (!name || name === 'all') return this._sendEmbed(message, authorModel);

		return this._findCommand(message, name, authorModel)
			|| this._findCategory(message, name, authorModel);
	}

	private _findCategory(message: Message, name: string, authorModel: UserModel): Promise<Message | Message[]> {
		let embed: MessageEmbed;
		for (const command of this.handler._commands.values()) {
			if (command.category.toLowerCase() === name) {
				if (!embed) {
					embed = MessageEmbed.common(message, authorModel)
						.setAuthor(`${this.client.user.username}'s ${titleCase(name)} Commands`)
						.setThumbnail(message.guild.iconURL())
						.setURL('http://kannathebot.me/guild')
						.setDescription('\u200b');
				}

				embed.addField(`kanna ${command.name}`, `k!${command.usage}`, true);
			}
		}

		if (embed) return message.channel.send(embed);

		return message.reply(`I could not find a command matching **${name}** <:KannaAyy:315270615844126720>`);
	}

	private _findCommand(message: Message, name: string, authorModel: UserModel): Promise<Message | Message[] | void> {
		const command: Command = this.handler.resolveCommand(name);

		if (!command) {
			return undefined;
		}

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`${titleCase(command.name)}'s Info`, this.client.user.displayAvatarURL())
			.setDescription(command.description)
			.setURL('http://kannathebot.me/guild')
			.setThumbnail(message.guild.iconURL());
		if (command.aliases.length) {
			embed.addField('Aliases', `kanna ${command.aliases.join('\nkanna ')}`);
		}

		embed.addField('Usage', `kanna ${command.usage}`)
			.addField('Example(s)', `kanna ${command.examples.join('\nkanna ')}`)
			.addField('Permissions Level Required', command.permLevel, true)
			.addField('Enabled', command.enabled ? 'Yes' : 'No', true);

		return message.channel.send(embed);
	}

	private _mapCategories(message: Message, authorModel: UserModel): MessageEmbed[] {
		// Map all commands to their appropiate categories
		const categories: Collection<string, Command[]> = new Collection();
		for (const command of this.handler._commands.values()) {
			const category: Command[] = categories.get(command.category);
			if (!category) categories.set(command.category, [command]);
			else category.push(command);
		}

		// Cache permission level
		const permLevel: PermLevels = authorModel.permLevel(message.member);

		// Make embeds out of them
		const embeds: MessageEmbed[] = [];
		for (const [category, commands] of categories) {
			const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
				.setThumbnail(message.guild.iconURL())
				.setURL('http://kannathebot.me/guild')
				.setAuthor(`${this.client.user.username}'s ${titleCase(category)} Commands`)
				.setDescription('\u200b');

			for (const command of commands) {
				if (command.permLevel > permLevel) continue;
				embed.addField(`kanna ${command.name}`, `k!${command.usage}`, true);
			}

			if (embed.fields.length) embeds.push(embed);
		}

		return embeds;
	}

	private async _sendEmbed(message: Message, authorModel: UserModel): Promise<void> {
		const embeds: MessageEmbed[] = this._mapCategories(message, authorModel);
		let page: number = 0;
		const selectEmbed: (increment: boolean) => MessageEmbed = (increment: boolean): MessageEmbed => {
			if (embeds[increment ? ++page : --page]) return embeds[page];

			page = page <= 0
				? embeds.length - 1
				: 0;

			return embeds[page];
		};

		const helpMessage: Message = await message.channel.send({ embed: embeds[0] }) as Message;
		const emojis: string[] = ['⬅', '➡', '❎'];
		const reactions: MessageReaction[] = [];

		let timeout: NodeJS.Timer;
		const filter: CollectorFilter = (reaction: MessageReaction, user: User): boolean =>
			emojis.includes(reaction.emoji.name) && user.id === message.author.id;
		const reactionCollector: ReactionCollector = helpMessage.createReactionCollector(filter)
			.on('collect', (reaction: MessageReaction) => {
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(() => reactionCollector.stop(), 6e4);

				if (reaction.emoji.name === '➡') {
					reaction.users.remove(message.author).catch(() => undefined);
					helpMessage.edit({ embed: selectEmbed(true) })
						.catch((error: DiscordAPIError) => {
							reactionCollector.stop();
							throw error;
						});
				} else if (reaction.emoji.name === '⬅') {
					reaction.users.remove(message.author).catch(() => undefined);
					helpMessage.edit({ embed: selectEmbed(false) })
						.catch((error: DiscordAPIError) => {
							reactionCollector.stop();
							throw error;
						});
				} else if (reaction.emoji.name === '❎') {
					helpMessage.delete().catch(() => undefined);
				}
			})
			.on('end', () => {
				for (const reaction of reactions) {
					reaction.users.remove().catch(() => undefined);
				}
			});

		for (const emoji of emojis) reactions.push(await helpMessage.react(emoji));
		timeout = setTimeout(() => reactionCollector.stop(), 6e4);

		return undefined;
	}

}

export { HelpCommand as Command };
