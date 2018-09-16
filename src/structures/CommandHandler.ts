import {
	Collection,
	DMChannel,
	Message,
	MessageAttachment,
	MessageOptions,
	TextChannel,
} from 'discord.js';
import { readdir } from 'fs';
import { extname, join } from 'path';
import { captureBreadcrumb, captureException, captureMessage } from 'raven';
import { promisify } from 'util';

import { ListenerUtil } from '../decorators/ListenerUtil';
import { Loggable } from '../decorators/LoggerDecorator';
import { RavenContext } from '../decorators/RavenContext';
import { Guild as GuildModel } from '../models/Guild';
import { Emojis } from '../types/Emojis';
import { UserTypes } from '../types/UserTypes';
import { Client } from './Client';
import { Command } from './Command';
import { Logger } from './Logger';
import { MessageEmbed } from './MessageEmbed';
import { Resolver } from './Resolver';

const { on, registerListeners }: typeof ListenerUtil = ListenerUtil;
// tslint:disable-next-line:typedef
const readdirAsync = promisify(readdir);

/**
 * Handles incoming messages and executes commands if applicable.
 */
@Loggable('HANDLER')
export class CommandHandler {
	/**
	 * Collection of all registered commands
	 */
	public readonly _commands: Collection<string, Command> = new Collection<string, Command>();
	/**
	 * Instantiating client
	 */
	public readonly client: Client;
	/**
	 * Resolver
	 */
	public readonly resolver: Resolver;

	/**
	 * Collection of all registered aliases, pointing to their command's name
	 */
	private readonly _aliases: Collection<string, string> = new Collection<string, string>();
	/**
	 * Array of always valid prefixes
	 */
	private readonly _prefixes: string[];
	/**
	 * Reference to the logger
	 */
	private readonly logger: Logger;
	/**
	 * Instantiate a new command handler
	 */
	public constructor(client: Client) {
		this.client = client;

		this.resolver = new Resolver(this);
		this._prefixes = process.env.NODE_ENV === 'dev'
			? ['kanna ', 'k!', '-']
			: ['kanna ', 'k!'];

		client.once('ready', () => this._prefixes.push(`<@!?${this.client.user.id}> `));

		registerListeners(client, this);
	}

	public async loadCategoriesIn(path: string): Promise<void> {
		const folders: string[] = await readdirAsync(path);
		for (const folder of folders) this.loadCommandsIn(path, folder);
	}

	public loadCommand(path: string, folder: string, file?: string): void {
		const location: string = file
			? join(path, folder, file)
			: path;

		const commandConstructor: new (handler: CommandHandler) => Command = require(location).Command;
		const command: Command = new commandConstructor(this);

		command.location = location;
		command.category = folder;

		const existing: Command = this._commands.get(command.name);
		if (existing) {
			throw new Error(
				`${commandConstructor.name}: Command name "${command.name}" already in use by ${existing.constructor.name}!`,
			);
		}

		this._commands.set(command.name, command);
		for (const alias of command.aliases) {
			const existingAlias: string = this._aliases.get(alias);
			if (existingAlias) {
				const name: string = this._commands.get(existingAlias).constructor.name;
				throw new Error(
					`${commandConstructor.name}: Command alias "${alias}" already in use by ${name}!`,
				);
			}
			this._aliases.set(alias, command.name);
		}
	}

	public async loadCommandsIn(path: string, folder: string): Promise<void> {
		const files: string[] = await readdirAsync(join(path, folder));
		let failed: number = 0;
		for (const file of files) {
			if (extname(file) !== '.js') {
				++failed;

				continue;
			}

			try {
				this.loadCommand(path, folder, file);
			} catch (error) {
				++failed;

				this.logger.error(`Error while loading ${join(path, folder, file)}`, error);
				captureException(error, {
					extra: {
						category: folder,
						commandName: file,
						path,
					},
				});
			}

		}

		this.logger.info(`Loaded ${files.length - failed} ${folder} commands.`);
	}

	public async reloadCommand(command: string | Command): Promise<void> {
		if (!(command instanceof Command)) command = this.resolveCommand(command);
		if (!command) throw new Error('Could not find the specified command!');

		// On error this will have been run regardless, may lead to unexpected consequences.
		// TODO: Somehow fix this if it's necessary?
		await command.free();

		this._commands.delete(command.name);
		for (const alias of command.aliases) {
			this._aliases.delete(alias);
		}

		try {
			this.loadCommand(command.location, command.category);
		} catch (error) {
			// Re-register old command on error
			this._commands.set(command.name, command);
			for (const alias of command.aliases) {
				this._aliases.set(alias, command.name);
			}

			throw error;
		}
	}

	/**
	 * Resolves a command by command name or alias
	 */
	public resolveCommand(commandName: string): Command {
		return this._commands.get(commandName)
			|| this._commands.get(this._aliases.get(commandName));
	}

	@on('message')
	@RavenContext
	protected async handle(message: Message): Promise<void> {
		// Ignore dms
		if (message.channel instanceof DMChannel) {
			this.client.channels.remove(message.channel.id);
			await message.channel.delete().catch(() => null);
			message.channel.messages.delete(message.id);

			return;
		}

		// Keep "Requested by" embeds
		if (message.author.id === this.client.user.id
			&& message.embeds.length && message.embeds[0].footer
			&& /^Requested by (.+?) \|.* (.+)$/.test(message.embeds[0].footer.text)
		) return;

		try {
			if (message.author.bot || !(message.channel instanceof TextChannel)) return;

			if (!message.member) {
				captureMessage('Uncached member',
					{
						extra: {
							author: message.author.toJSON(),
							member_api_count: message.guild.memberCount,
							member_cache_count: message.guild.members.size,
							message: message.toJSON(),
						},
						level: 'warn',
					});

				await message.guild.members.fetch(message.author.id);
			}

			captureBreadcrumb({
				category: 'Meta',
				data: {
					author: `${message.author.tag} (${message.author.id})`,
					channel: `#${message.channel.name} (${message.channel.id})`,
					content: message.content,
					guild: `${message.guild.name} (${message.guild.id})`,
					permissions: {
						member_channel: message.channel.permissionsFor(message.member),
						member_guild: message.member.permissions,
						self_channel: message.channel.permissionsFor(this.client.user),
						self_guild: message.guild.me.permissions,
					},
					shard_id: String(this.client.shard.id),
				},
				level: 'debug',
			});

			const guildModel: GuildModel = message.guild.model || await message.guild.fetchModel();
			const [command, commandName, args]: [Command, string, string[]]
				| [undefined, undefined, undefined] = this._matchCommand(message, guildModel);
			if (!command) return;

			captureBreadcrumb({ category: 'Command', data: { commandName }, level: 'debug' });

			const [authorModel, ownerModel] = await Promise.all([
				message.author.fetchModel(),
				this.client.users.get(message.guild.ownerID).fetchModel(),
				message.guild.owner ? undefined : message.guild.members.fetch(message.guild.ownerID),
			]);

			if (authorModel.type === UserTypes.BLACKLISTED) return;
			if (ownerModel.type === UserTypes.BLACKLISTED) return;

			if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) {
				message.author.send('I do not have permission to send in the channel of your command!')
					.catch(() => undefined);

				return;
			}

			const canCallRes: true | string = await command.canCall(message, authorModel);

			if (typeof canCallRes === 'string') {
				await message.reply(canCallRes);

				return;
			}

			try {
				const parsedArgs: any[] | string | MessageOptions | MessageEmbed | MessageAttachment
					= await command.parseArgs(message, args, { authorModel, commandName, args });

				if (!(parsedArgs instanceof Array)) {
					await message.reply(parsedArgs);

					return;
				}

				await authorModel.$create('CommandLog', {
					commandName: command.name,
					guildId: message.guild.id,
					userId: message.author.id,
				});

				await command.run(message, parsedArgs, { authorModel, commandName, args });

				const newLevel: number | void = await command.grantRewards(message.author, authorModel);
				if (newLevel && guildModel.levelUpEnabled) {
					await message.reply(`you advanced to level **${newLevel}**! ${Emojis.KannaHug}`);
				}
			} catch (error) {
				captureException(error, {
					extra: {
						channel_deleted: message.channel.deleted,
						guild_deleted: message.guild.deleted,
						message_deleted: message.deleted,
						permissions: {
							member_channel: message.channel.permissionsFor(message.member),
							member_guild: message.member.permissions,
							self_channel: message.channel.permissionsFor(this.client.user),
							self_guild: message.guild.me.permissions,
						},
					},
					// Sentry does not allow to filter based on breadcrumbs, but via tags
					tags: {
						command: commandName,
					},
				});

				this.logger.error(error);
				message.reply(
					'**an errror occured, but rest assured! It has already been reported and will be fixed in no time!**',
				).catch(() => null);
			}
		} finally {
			message.channel.messages.delete(message.id);
		}
	}

	private _matchCommand(message: Message, guildModel: GuildModel):
		[Command, string, string[]] | [undefined, undefined, undefined] {
		const prefixes: string[] = guildModel.prefix ? this._prefixes.concat(guildModel.prefix) : this._prefixes;
		const match: RegExpExecArray = new RegExp(`^(${prefixes.join('|')})`, 'i').exec(message.content);

		if (!match) return [undefined, undefined, undefined];

		const [commandName, ...args]: string[] = message.content.slice(match[1].length).split(/ +/);
		const command: Command = this.resolveCommand(commandName.toLowerCase());
		if (!command) return [undefined, undefined, undefined];

		return [command, commandName.toLowerCase(), args];
	}
}
