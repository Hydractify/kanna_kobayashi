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

		return this._findCategory(message, name, authorModel)
			|| this._findCommand(message, name, authorModel);
	}

	private _findCategory(message: Message, name: string, authorModel: UserModel): Promise<Message | Message[]> | void {
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

				embed.addField(`kanna ${command.name}`, command.usage, true);
			}
		}

		if (embed) message.channel.send(embed);
	}

	private _findCommand(message: Message, name: string, authorModel: UserModel): Promise<Message | Message[]> {
		const command: Command = this.handler.resolveCommand(name);

		if (!command) {
			return message.reply(`I could not find a command matching **${name}** <:KannaAyy:315270615844126720>`);
		}

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`${titleCase(command.name)}'s Info`, this.client.user.displayAvatarURL())
			.setDescription('\u200b')
			.setURL('http://kannathebot.me/guild')
			.setThumbnail(message.guild.iconURL())
			.addField('Aliases', `kanna ${command.aliases.join('\nkanna ')}`)
			.addField('Usage', `kanna ${command.usage}`)
			.addField('Example(s)', `kanna ${command.examples.join('\nkanna ')}`)
			.addField('Description', command.description)
			.addField('Permissions Level Required', command.permLevel)
			.addField('Enabled', command.enabled ? 'Yes' : 'No');

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

		const helpMessage: Message = await message.channel.send({ embed: embeds[0] }) as Message;
		const emojis: string[] = ['⬅', '➡', '❎'];
		for (const emoji of emojis) {
			await helpMessage.react(emoji);
		}

		let page: number = 0;
		const selectEmbed: (increment: boolean) => MessageEmbed = (increment: boolean): MessageEmbed => {
			if (embeds[increment ? ++page : --page]) return embeds[page];

			page = page <= 0
				? embeds.length - 1
				: 0;

			return embeds[page];
		};

		const filter: CollectorFilter = (reaction: MessageReaction, user: User): boolean =>
			emojis.includes(reaction.emoji.name) && user.id === message.author.id;

		const reactionCollector: ReactionCollector = helpMessage.createReactionCollector(filter, { time: 3e4 })
			.on('collect', (reaction: MessageReaction) => {
				if (reaction.emoji.name === '➡') {
					reaction.remove(message.author).catch(() => undefined);
					helpMessage.edit({ embed: selectEmbed(true) })
						.catch((error: DiscordAPIError) => {
							reactionCollector.stop();
							throw error;
						});
				}

				if (reaction.emoji.name === '⬅') {
					reaction.remove(message.author).catch(() => undefined);
					helpMessage.edit({ embed: selectEmbed(false) })
						.catch((error: DiscordAPIError) => {
							reactionCollector.stop();
							throw error;
						});
				}
				if (reaction.emoji.name === '❎') {
					reactionCollector.stop();
				}
			})
			.on('end', () => {
				message.delete().catch(() => undefined);
				helpMessage.delete().catch(() => undefined);
			});

		return undefined;
	}

}

export { HelpCommand as Command };
