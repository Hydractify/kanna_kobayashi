import
{
	Collection,
	DMChannel,
	GuildMember,
	Message,
	MessageAttachment,
	MessageOptions,
	User,
} from 'discord.js';
import { readdir } from 'fs';
import { extname, join } from 'path';
import { Counter } from 'prom-client';
import { captureBreadcrumb, captureException, captureMessage } from 'raven';
import { promisify } from 'util';

import { ListenerUtil } from '../decorators/ListenerUtil';
import { Loggable } from '../decorators/LoggerDecorator';
import { RavenContext } from '../decorators/RavenContext';
import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';
import { Emojis } from '../types/Emojis';
import { isGuildMessage } from '../types/GuildMessage';
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
export class CommandHandler
{
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
	 * Counter for the amount of commands ran.
	 */
	private readonly _commandCounter: Counter = new Counter({
		help: 'Total amount of commands received',
		name: 'kanna_kobayashi_command_count',
	});

	/**
	 * Reference to the logger
	 */
	private readonly logger!: Logger;

	/**
	 * Instantiate a new command handler
	 */
	public constructor(client: Client)
	{
		this.client = client;

		this.resolver = new Resolver(this);
		this._prefixes = process.env.NODE_ENV === 'dev'
			? ['kanna ', 'k!', '-']
			: ['kanna ', 'k!'];

		client.once('ready', () => this._prefixes.push(`<@!?${this.client.user!.id}>`));

		registerListeners(client, this);
	}

	public async loadCategoriesIn(path: string): Promise<void>
	{
		const folders: string[] = await readdirAsync(path);
		for (const folder of folders) this.loadCommandsIn(path, folder);
	}

	public loadCommand(path: string, folder: string, file?: string): void
	{
		const location: string = file
			? join(path, folder, file)
			: path;

		const commandConstructor: new (handler: CommandHandler) => Command = require(location).Command;
		const command: Command = new commandConstructor(this);

		command.location = location;
		command.category = folder;

		const existing: Command | undefined = this._commands.get(command.name);
		if (existing)
		{
			throw new Error(
				`${commandConstructor.name}: Command name "${command.name}" already in use by ${existing.constructor.name}!`,
			);
		}

		this._commands.set(command.name, command);
		for (const alias of command.aliases)
		{
			const existingAlias: string | undefined = this._aliases.get(alias);
			if (existingAlias)
			{
				const name: string = this._commands.get(existingAlias)!.constructor.name;
				throw new Error(
					`${commandConstructor.name}: Command alias "${alias}" already in use by ${name}!`,
				);
			}
			this._aliases.set(alias, command.name);
		}
	}

	public async loadCommandsIn(path: string, folder: string): Promise<void>
	{
		const files: string[] = await readdirAsync(join(path, folder));
		let failed: number = 0;
		for (const file of files)
		{
			if (extname(file) !== '.js')
			{
				++failed;

				continue;
			}

			try
			{
				this.loadCommand(path, folder, file);
			}
			catch (error)
			{
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

	public async reloadCommand(input: string | Command): Promise<void>
	{
		// Small helper to make TS happy
		let command: string | Command | undefined = input;
		if (!(command instanceof Command)) command = this.resolveCommand(command);
		if (!command) throw new Error('Could not find the specified command!');

		// On error this will have been run regardless, may lead to unexpected consequences.
		// TODO: Somehow fix this if it's necessary?
		await command.free();

		this._commands.delete(command.name);
		for (const alias of command.aliases)
		{
			this._aliases.delete(alias);
		}

		try
		{
			this.loadCommand(command.location, command.category);
		}
		catch (error)
		{
			// Re-register old command on error
			this._commands.set(command.name, command);
			for (const alias of command.aliases)
			{
				this._aliases.set(alias, command.name);
			}

			throw error;
		}
	}

	/**
	 * Resolves a command by command name or alias
	 */
	public resolveCommand(commandName: string): Command | undefined
	{
		return this._commands.get(commandName)
			|| this._commands.get(this._aliases.get(commandName)!);
	}

	@on('message')
	@RavenContext
	protected async handle(message: Message): Promise<void>
	{
		// Ignore dms
		if (message.channel instanceof DMChannel)
		{
			this.client.channels.cache.delete(message.channel.id);
			await message.channel.delete().catch(() => null);
			message.channel.messages.delete(message.id);

			return;
		}

		// Ignore system messages
		if (message.system)
		{
			message.channel.messages.delete(message.id);

			return;
		}

		// Keep "Requested by" embeds
		if (message.author.id === this.client.user!.id &&
			message.embeds[0]?.footer?.text?.match(/^Requested by (.+?) \|.* (.+)$/)
		) return;

		try
		{
			if (!isGuildMessage(message) || message.author.bot) return;

			if (!message.member)
			{
				captureMessage('Uncached member',
					{
						extra: {
							author: message.author.toJSON(),
							memberApiCount: message.guild.memberCount,
							memberCacheCount: message.guild.members.cache.size,
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
						memberChannel: message.channel.permissionsFor(message.member),
						memberGuild: message.member.permissions,
						selfChannel: message.channel.permissionsFor(this.client.user ?? ''),
						selfGuild: message.guild.me?.permissions ?? 'Uncached',
					},
					shardIds: this.client.shard!.ids.map((id: number) => id.toLocaleString()).join(', '),
				},
				level: 'debug',
			});

			const guildModel: GuildModel = message.guild.model || await message.guild.fetchModel();
			const [command, commandName, args]: [Command, string, string[]] | [undefined, undefined, undefined]
				= this._matchCommand(message, guildModel);
			if (!command || !commandName || !args) return;

			this._commandCounter.inc();
			captureBreadcrumb({ category: 'Command', data: { commandName }, level: 'debug' });

			const [authorModel, ownerModel]: [UserModel, UserModel, GuildMember | undefined] =
				await Promise.all<UserModel, UserModel, GuildMember | undefined>([
					message.author.fetchModel(),
					this.client.users.fetch(message.guild.ownerID).then((owner: User) => owner.fetchModel()),
					message.guild.owner ? undefined : message.guild.members.fetch(message.guild.ownerID),
				]);

			if (authorModel.type === UserTypes.BLACKLISTED) return;
			if (ownerModel.type === UserTypes.BLACKLISTED) return;

			if (!(message.guild.me?.permissionsIn(message.channel)?.has('SEND_MESSAGES') ?? false))
			{
				message.author.send('I do not have permission to send in the channel of your command!')
					.catch(() => undefined);

				return;
			}

			const canCallRes: true | string = await command.canCall(message, authorModel);

			if (typeof canCallRes === 'string')
			{
				await message.reply(canCallRes);

				return;
			}

			try
			{
				const parsedArgs: any[] | string | MessageOptions | MessageEmbed | MessageAttachment
					= await command.parseArgs(message, args, { authorModel, commandName, args });

				if (!(parsedArgs instanceof Array))
				{
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
				if (newLevel && guildModel.levelUpEnabled)
				{
					await message.reply(`you advanced to level **${newLevel}**! ${Emojis.KannaHug}`);
				}
			}
			catch (error)
			{
				this.client.errorCount.inc({ type: 'Command' });
				captureException(error, {
					extra: {
						channelDeleted: message.channel.deleted,
						guildDeleted: message.guild.deleted,
						messageDeleted: message.deleted,
						permissions: {
							memberChannel: message.channel.permissionsFor(message.member),
							memberGuild: message.member.permissions,
							selfChannel: message.channel.permissionsFor(this.client.user ?? ''),
							selfGuild: message.guild.me?.permissions ?? 'Uncached',
						},
					},
					// Sentry does not allow to filter based on breadcrumbs, but via tags
					tags: {
						command: commandName,
					},
				});

				this.client.webhook.error('CommandError', message.guild.shardID, error);
				message.reply(
					'**an error occured, but rest assured! It has already been reported and will be fixed in no time!**',
				).catch(() => null);
			}
		}
		finally
		{
			message.channel.messages.delete(message.id);
		}
	}

	private _matchCommand(
		message: Message,
		guildModel: GuildModel
	): [Command, string, string[]] | [undefined, undefined, undefined]
	{
		const prefixes: string[] = guildModel.prefix ? this._prefixes.concat(guildModel.prefix) : this._prefixes;
		const match: RegExpExecArray | null = new RegExp(`^(${prefixes.join(' *|')})`, 'i').exec(message.content);

		if (!match) return [undefined, undefined, undefined];

		const [commandName, ...args]: string[] = message.content.slice(match[1].length).split(/ +/);
		const command: Command | undefined = this.resolveCommand(commandName.toLowerCase());
		if (!command) return [undefined, undefined, undefined];

		return [command, commandName.toLowerCase(), args];
	}
}
