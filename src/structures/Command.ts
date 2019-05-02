import {
	Message,
	MessageAdditions,
	MessageOptions,
	Permissions,
	PermissionString,
	TextChannel,
	User,
} from 'discord.js';
import { duration } from 'moment';
// tslint:disable-next-line:no-import-side-effect
import 'moment-duration-format';
import { Sequelize } from 'sequelize-typescript';

import { Sequelize as sequelize } from '../decorators/SequelizeDecorator';
import { CommandLog } from '../models/CommandLog';
import { User as UserModel } from '../models/User';
import { ICommandInfo } from '../types/ICommandInfo';
import { ICommandRunInfo } from '../types/ICommandRunInfo';
import { MaybePromise } from '../types/MaybePromise';
import { PermLevels } from '../types/PermLevels';
import { titleCase } from '../util/Util';
import { Client } from './Client';
import { CommandHandler } from './CommandHandler';
import { Resolver } from './Resolver';

/**
 * Represents an abstract Command
 */
@sequelize
export abstract class Command {
	/**
	 * Array of aliases for the command
	 */
	public readonly aliases: string[];
	/**
	 * Which category the command is in
	 */
	public category!: string;
	/**
	 * Client the command belongs to
	 */
	public readonly client: Client;
	/**
	 * Permissions the bot has to have to be able to execute the command
	 */
	public readonly clientPermissions: PermissionString[];
	/**
	 * Time to wait between multiple usages of the command
	 */
	public readonly cooldown: number;
	/**
	 * Brief description of the command
	 */
	public readonly description: string;
	/**
	 * A few examples to describe how to use the command
	 */
	public readonly examples: string[];
	/**
	 * Base amount of exp that users receive
	 */
	public readonly exp: number;
	/**
	 * Whether the command is guarded (May not be disabled)
	 */
	public readonly guarded: boolean;
	/**
	 * Instantiating command handler
	 */
	public readonly handler: CommandHandler;
	/**
	 * Abosulute path of the command
	 */
	public location!: string;
	/**
	 * Name of the command
	 */
	public readonly name: string;
	/**
	 * Whether this command is patreon only
	 */
	public readonly patreonOnly: boolean;
	/**
	 * Permission level required to use the command
	 */
	public readonly permLevel: PermLevels;
	/**
	 * Reference to the resolver
	 */
	public readonly resolver: Resolver;
	/**
	 * String describing how this command is meant to use
	 */
	public readonly usage: string;

	/**
	 * Reference to the sequelize connection
	 */
	protected sequelize!: Sequelize;

	/**
	 * Instantiates a new command
	 */
	protected constructor(handler: CommandHandler, {
		aliases = [],
		clientPermissions = [],
		cooldown = 5000,
		description,
		examples,
		exp = 5,
		guarded = false,
		patreonOnly = false,
		permLevel = PermLevels.EVERYONE,
		usage,
	}: ICommandInfo) {
		this.name = this.constructor.name.replace(/Command$/, '').toLowerCase();

		// Assert correct type
		if (!(handler instanceof CommandHandler)) {
			throw new TypeError(`Command ${this.name}'s handler is not instanceof CommandHandler!`);
		}
		if (!(aliases instanceof Array)) {
			throw new TypeError(`Command ${this.name}'s aliases is not instanceof array!`);
		}
		if (!(clientPermissions instanceof Array)) {
			throw new TypeError(`Command ${this.name}'s clientPermissions is not instanceof array!`);
		}
		if (!description) {
			throw new Error(`Command ${this.name} does not have a description!`);
		}
		if (!(examples instanceof Array)) {
			throw new TypeError(`Command ${this.name}'s examples is not instanceof array!`);
		}
		// Assert correct value
		for (const permission of clientPermissions) {
			try {
				Permissions.resolve(permission);
			} catch (error) {
				throw new RangeError(`${permission} is not a valid permission string!`);
			}
		}

		this.aliases = aliases;
		this.clientPermissions = clientPermissions;
		this.client = handler.client;
		this.cooldown = cooldown;
		this.description = description;
		this.examples = examples;
		this.exp = exp;
		this.guarded = guarded;
		this.handler = handler;
		this.resolver = handler.resolver;
		this.usage = usage;
		this.patreonOnly = patreonOnly;
		this.permLevel = permLevel;
	}

	/**
	 * Determines whether the command may be called by the executing user.
	 * Resolves with true on success or with a reason string on failure.
	 */
	public async canCall(message: Message, authorModel: UserModel): Promise<true | string> {
		if (this.clientPermissions.length) {
			const missing: PermissionString[] = (message.channel as TextChannel)
				.permissionsFor(message.guild.me)!
				.missing(this.clientPermissions);

			if (missing.length) {
				const missingPermsString: string = missing.map((perm: string) =>
					titleCase(perm.replace(/_/g, ' ')),
				).join(', ');

				return `I require the following permissions to execute the **${this.name}** command: **${missingPermsString}**!`;
			}
		}

		const permLevel: PermLevels = authorModel.permLevel(message.member);
		if (this.patreonOnly && authorModel.tier <= 0 && permLevel < PermLevels.TRUSTED) {
			return `**${this.name}** is for patreons only!`;
		}

		if (this.permLevel > permLevel) {
			return `you do not have the required permission level to use **${this.name}**!`;
		}

		if (!this.guarded && message.guild.model.disabledCommands.includes(this.name)) {
			return `the **${this.name}** command is currently server wide disabled!`;
		}

		if (permLevel < PermLevels.TRUSTED) {
			const [commandLog] = await authorModel.$get<CommandLog>('CommandLogs', {
				limit: 1,
				order: [['run', 'DESC']],
				where: { commandName: this.name },
			}) as CommandLog[];

			const timeLeft: number = commandLog
				? (commandLog.run.getTime() + this.cooldown) - Date.now()
				: 0;

			if (timeLeft > 0) {
				const timeLeftString: string = duration(timeLeft, 'milliseconds')
					.format('d [days], h [hours], m [minutes], s [seconds]');

				return `**${this.name}** is on cooldown!\nPlease wait **${timeLeftString}** and try again!`;
			}
		}

		return true;
	}

	/**
	 * Should be overriden if custom re-requiring or other resource freeing action is required.
	 * @virtual
	 */
	public async free(): Promise<void> {
		delete require.cache[require.resolve(this.location)];
	}

	/**
	 * Grant a user experience for using this command.
	 *
	 * Returns the new level if user level'd up, or void if not.
	 */
	public async grantRewards(user: User, userModel: UserModel): Promise<number | void> {
		if (!this.exp) return;

		const { level } = userModel;

		await userModel.increment({ exp: this.exp });

		userModel.exp += this.exp;
		if (userModel.level > level) return userModel.level;
	}

	/**
	 * Should be overriden if parsing and validating of args is required.
	 * Should return an array on success, anything sendable as response to the user, on failure.
	 * @virtual
	 */
	public parseArgs(
		message: Message,
		args: string[],
		info: ICommandRunInfo,
	): MaybePromise<any[] | string | MessageOptions | MessageAdditions> {
		return args;
	}

	/**
	 * Main entry point for the actual execution of the command.
	 * @abstract
	 */
	public abstract run(message: Message, args: any[], info: ICommandRunInfo): MaybePromise<any>;
}
