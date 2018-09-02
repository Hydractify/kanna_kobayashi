import {
	Collection,
	Guild,
	GuildMember,
	Message,
	MessageReaction,
	User,
} from 'discord.js';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IResponsiveEmbedController } from '../../types/IResponsiveEmbedController';
import { PermLevels } from '../../types/PermLevels';
import { titleCase } from '../../util/Util';

class HelpCommand extends Command implements IResponsiveEmbedController {
	public emojis: string[] = ['⬅', '➡'];

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['halp', 'commands'],
			clientPermissions: ['ADD_REACTIONS', 'EMBED_LINKS'],
			cooldown: 10000,
			description: [
				'Let me show you all the commands (or a specifc one), that I have!',
				'_PS: Use the arrow reactions to scroll through categories_',
			].join('\n'),
			examples: ['help ping', 'help'],
			guarded: true,
			name: 'help',
			permLevel: 0,
			usage: 'help [Command|Category]',
		});
	}

	public async run(
		message: Message,
		[name]: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[] | void> {
		if (name) name = name.toLowerCase();

		if (!name || name === 'all') {
			const helpMessage: Message = await message.channel.send(this._mapCategories(message, authorModel)[0]) as Message;
			for (const emoji of this.emojis) await helpMessage.react(emoji);

			return;
		}

		return this._findCommand(message, name, authorModel)
			|| this._findCategory(message, name, authorModel);
	}

	public async onCollect({ emoji, users, message }: MessageReaction, user: User): Promise<Message> {
		const [, rawPage]: RegExpExecArray = /.+? \| Page (\d+) \|/.exec(message.embeds[0].footer.text) || [] as any;
		if (!rawPage) return;

		let page: number = parseInt(rawPage) - 1;
		if (isNaN(page)) return;
		users.remove(user).catch(() => undefined);

		const embeds: MessageEmbed[] = this._mapCategories({
			author: user,
			guild: message.guild,
			member: message.guild.member(user) || await message.guild.members.fetch(user),
		}, await user.fetchModel());

		if (emoji.name === '➡') {
			++page;
			if (page >= embeds.length) page = 0;

		} else if (emoji.name === '⬅') {
			if (page <= 0) page = embeds.length - 1;
			else --page;
		}

		return message.edit(embeds[page]);
	}

	private _findCategory(message: Message, name: string, authorModel: UserModel): Promise<Message | Message[]> {
		let embed: MessageEmbed;
		for (const command of this.handler._commands.values()) {
			if (command.category.toLowerCase() === name) {
				if (!embed) {
					embed = MessageEmbed.common(message, authorModel)
						.setAuthor(`${this.client.user.username}'s ${titleCase(name)} Commands`)
						.setDescription([
							'[Having trouble using the help command? Read the wiki!]',
							'(https://github.com/TheDragonProject/Kanna-Kobayashi/wiki)',
						].join(''))
						.setThumbnail(message.guild.iconURL())
						.setURL('https://thedragonproject.network/guild');
				}

				embed.addField(`kanna ${command.name}`, `k!${command.usage}`, true);
			}
		}

		if (embed) return message.channel.send(embed);

		return message.reply(`I could not find a command matching **${name}** <:kannaShy:458779242696540170>`);
	}

	private _findCommand(message: Message, name: string, authorModel: UserModel): Promise<Message | Message[] | void> {
		const command: Command = this.handler.resolveCommand(name);

		if (!command) {
			return undefined;
		}

		const commandEnabled: boolean = message.guild.model.disabledCommands.includes(command.name);
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`${titleCase(command.name)}'s Info`, this.client.user.displayAvatarURL())
			.setDescription(command.description)
			.setURL('https://thedragonproject.network/guild')
			.setThumbnail(message.guild.iconURL());
		if (command.aliases.length) {
			embed.addField('Aliases', `kanna ${command.aliases.join('\nkanna ')}`);
		}

		embed.addField('Usage', `kanna ${command.usage}`)
			.addField(`Example${command.examples.length === 1 ? '' : 's'}`, `kanna ${command.examples.join('\nkanna ')}`)
			.addField('Permissions Level Required', command.permLevel, true)
			.addField('Enabled', commandEnabled ? 'Yes' : 'No', true);

		return message.channel.send(embed);
	}

	private _mapCategories(
		{ author, member, guild }: { author: User, member: GuildMember, guild: Guild },
		authorModel: UserModel,
	): MessageEmbed[] {
		// Map all commands to their appropiate categories
		const categories: Collection<string, Command[]> = new Collection();
		for (const command of this.handler._commands.values()) {
			const category: Command[] = categories.get(command.category);
			if (!category) categories.set(command.category, [command]);
			else category.push(command);
		}

		// Cache permission level
		const permLevel: PermLevels = authorModel.permLevel(member);

		// Make embeds out of them
		const embeds: MessageEmbed[] = [];
		for (const [category, commands] of categories) {
			const embed: MessageEmbed = MessageEmbed.common({ author }, authorModel)
				.setThumbnail(guild.iconURL())
				.setURL('https://thedragonproject.network/guild')
				.setAuthor(`${this.client.user.username}'s ${titleCase(category)} Commands`)
				.setDescription([
					'[Having trouble using the help command? Read the wiki!]',
					'(https://github.com/TheDragonProject/Kanna-Kobayashi/wiki)',
				].join(''));

			embed.footer.text += ` | Page ${embeds.length + 1} | Help`;

			for (const command of commands) {
				if (command.permLevel > permLevel) continue;
				embed.addField(`kanna ${command.name}`, `k!${command.usage}`, true);
			}

			if (embed.fields.length) embeds.push(embed);
		}

		return embeds;
	}
}

export { HelpCommand as Command };
