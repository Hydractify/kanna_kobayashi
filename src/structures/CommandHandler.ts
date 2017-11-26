import { Collection, GuildMember, Message, Permissions, PermissionString, TextChannel } from 'discord.js';
import { readdir } from 'fs';
import { duration } from 'moment';
// tslint:disable-next-line:no-import-side-effect
import 'moment-duration-format';
import { join } from 'path';
import { captureException } from 'raven';
import { promisify } from 'util';

import { CommandLog } from '../models/CommandLog';
import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';
import { UserTypes } from '../types/UserTypes';
import { ListenerUtil } from '../util/ListenerUtil';
import { Loggable } from '../util/LoggerDecorator';
import { titleCase } from '../util/Util';
import { Client } from './Client';
import { Command } from './Command';
import { Logger } from './Logger';
import { Resolver } from './Resolver';

const { on, registerListeners }: typeof ListenerUtil = ListenerUtil;
// tslint:disable-next-line:typedef
const readdirAsync = promisify(readdir);

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
		this._prefixes = [`<@!?${this.client.user.id}>`, 'kanna ', 'k!'];

		registerListeners(client, this);
	}

	public async loadCategoriesIn(path: string): Promise<void> {
		const folders: string[] = await readdirAsync(path);
		for (const folder of folders) this.loadCommandsIn(path, folder);
	}

	public loadCommand(path: string, folder: string, file: string): void {
		const location: string = join(path, folder, file);
		const commandConstructor: new (handler: CommandHandler) => Command = require(location);
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
		for (const file of files) {
			let failed: number = 0;
			try {
				this.loadCommand(path, folder, file);
			} catch (error) {
				++failed;
				captureException(error, {
					extra: {
						commandName: file,
						category: folder,
						path,
					},
				});
			}

			this.logger.info(`Loaded ${files.length - failed} ${folder} commands.`);
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
		if (ownerModel.type === UserTypes.BLACKLISTED
			|| (ownerModel.type !== UserTypes.WHITELISTED && message.guild.isBotFarm)
		) return;

		if (!await this._canCallCommand(message, authorModel, command)) return;
	}

	private async _canCallCommand(message: Message, authorModel: UserModel, command: Command): Promise<boolean> {
		const permissions: Permissions = (message.channel as TextChannel).permissionsFor(message.guild.me);
		if (!permissions.has('SEND_MESSAGES')) {
			message.author.send('I do not have permission to send in the channel of your command!')
				.catch(() => undefined);

			return false;
		}

		const missing: PermissionString[] = permissions.missing(command.clientPermissions) as PermissionString[];
		if (missing.length) {
			const missingPermsString: string = missing.map((perm: string) =>
				titleCase(perm.replace(/_/g, ' ')),
			).join(', ');

			message.reply(
				`I require the following permissions to execute the **${command.name}** command: **${missingPermsString}**!`,
			);

			return false;
		}

		if (command.permLevel > authorModel.permLevel(message.member)) {
			message.reply(`you do not have the require permission level to use **${command.name}**!`);

			return false;
		}

		if (!command.enabled) {
			message.reply(`**${command.name}** is currently disabled!`);

			return false;
		}

		const [commandLog] = await authorModel.$get<CommandLog>('CommandLogs', {
			limit: 1,
			order: [['run', 'desc']],
			where: { commandName: command.name },
		}) as CommandLog[];

		const timeLeft: number = commandLog
			? (commandLog.run.getTime() + command.cooldown) - Date.now()
			: 0;

		if (![UserTypes.DEV, UserTypes.TRUSTED].includes(authorModel.type)
			&& timeLeft > 0) {
			const timeLeftString: string = duration(timeLeft, 'milliseconds')
				.format('d [days], h [hours], m [minutes], s [seconds]');

			message.reply([
				`**${command.name}** is on cooldown!`,
				`Please wait **${timeLeftString}** and try again!`,
			].join('\n'));

			return false;
		}

		return true;
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
		const prefixes: string[] = this._prefixes.concat(guildModel.prefix);
		const match: RegExpExecArray = new RegExp(`^(${prefixes.join('|')})`, 'i').exec(message.content);

		if (!match) return [undefined, undefined, undefined];

		const [commandName, ...args]: string[] = message.content.slice(match[1].length).split(/ +/);
		const command: Command = this.resolveCommand(commandName.toLowerCase());
		if (!command) return [undefined, undefined, undefined];

		return [command, commandName.toLowerCase(), args];
	}
}
