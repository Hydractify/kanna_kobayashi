import { Collection, GuildMember, Message, TextChannel } from 'discord.js';
import { readdir } from 'fs';
import { extname, join } from 'path';
import { captureException, wrap } from 'raven';
import { promisify } from 'util';

import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';
import { UserTypes } from '../types/UserTypes';
import { Loggable } from '../util/LoggerDecorator';
import { Client } from './Client';
import { Command } from './Command';
import { Logger } from './Logger';
import { Resolver } from './Resolver';

// tslint:disable-next-line:typedef
const readdirAsync = promisify(readdir);

/**
 * Handles incoming messages and executes commands if applicable.
 */
@Loggable('HANDLER')
export class CommandHandler {
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
	 * Collection of all registered commands
	 */
	private readonly _commands: Collection<string, Command> = new Collection<string, Command>();
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
		this._prefixes = ['kanna ', 'k!', '-'];

		// Automatically wrap all received messages in a raven context
		client.on('message', wrap(this.handle.bind(this)));
		client.once('ready', () => this._prefixes.push(`<@!?${this.client.user.id}> `));
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

		this._commands.set(command.name, command);
		for (const alias of command.aliases) {
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
		if (!command) throw new Error(`Could not find the specified command!`);

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

	protected async handle(message: Message): Promise<void> {
		if (message.author.bot ||
			!(message.channel instanceof TextChannel)
		) return;

		const guildModel: GuildModel = message.guild.model || await message.guild.fetchModel();
		const [command, commandName, args]: [Command, string, string[]]
			| [undefined, undefined, undefined] = this._matchCommand(message, guildModel);
		if (!command) return;

		const [authorModel, ownerModel] = await this._fetchModels(message);
		if (authorModel.type === UserTypes.BLACKLISTED) return;
		if (ownerModel.type === UserTypes.BLACKLISTED) return;
		if (ownerModel.type !== UserTypes.WHITELISTED && message.guild.isBotFarm) return;

		if (!await command.canCall(message, authorModel)) return;

		try {
			// tslint:disable-next-line:no-any
			const parsedArgs: any[] | string = await command.parseArgs(message, args, { authorModel, commandName, args });

			if (!(parsedArgs instanceof Array)) {
				message.reply(parsedArgs);

				return;
			}

			await authorModel.$create('CommandLog', {
				commandName: command.name,
				guildId: message.guild.id,
				userId: message.author.id,
			});

			await command.run(message, parsedArgs, { authorModel, commandName, args });
		} catch (error) {
			this.logger.error(error);

			captureException(error, {
				extra: {
					author: `${message.author.tag} (${message.author.id})`,
					channel: `${message.channel.name} (${message.channel.id})`,
					content: message.content,
					guild: `${message.guild.name} (${message.guild.id})`,
				},
				tags: {
					command: command.name,
					shard_id: String(this.client.shard.id),
				},
			});

			message.reply(
				[
					'**an errror occured! Please paste this to the official guild support channel!**'
					+ ' <:KannaAyy:315270615844126720> https://discord.gg/uBdXdE9',
					'',
					'',
					`\\\`${command.name}\\\``,
					'\\`\\`\\`',
					error.stack,
					'\\`\\`\\`',
				].join('\n'),
			);
		}
	}

	private _fetchModels(message: Message): Promise<[UserModel, UserModel, GuildMember, GuildMember]> {
		const promises: [Promise<UserModel>, Promise<UserModel>, Promise<GuildMember>, Promise<GuildMember>] = [
			message.author.fetchModel(),
			this.client.users.get(message.guild.ownerID).fetchModel(),
			undefined,
			undefined,
		];

		if (!message.member) {
			promises[2] = message.guild.members.fetch(message.author.id)
				.then((member: GuildMember) => message.member = member);
		}

		if (!message.guild.owner) promises[3] = message.guild.members.fetch(message.guild.ownerID);

		return Promise.all(promises);
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
