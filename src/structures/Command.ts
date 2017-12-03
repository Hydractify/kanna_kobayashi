import { Message, Permissions, PermissionString } from 'discord.js';

import { ICommandInfo } from '../types/ICommandInfo';
import { ICommandRunInfo } from '../types/ICommandRunInfo';
import { PermLevels } from '../types/PermLevels';
import { Client } from './Client';
import { CommandHandler } from './CommandHandler';
import { Resolver } from './Resolver';

/**
 * Represents an abstract Command
 */
export abstract class Command {
	/**
	 * Array of aliases for the command
	 */
	public readonly aliases: string[];
	/**
	 * Which category the command is in
	 */
	public category: string;
	/**
	 * Client the command belongs to
	 */
	public readonly client: Client;
	/**
	 * Permissions the bot has to have to be able to execute the command
	 */
	public readonly clientPermissions: PermissionString[];
	/**
	 * Amount of coins granted when using the command
	 */
	public readonly coins: number;
	/**
	 * Time to wait between multiple usages of the command
	 */
	public readonly cooldown: number;
	/**
	 * Brief description of the command
	 */
	public readonly description: string;
	/**
	 * Whether the command is enabled
	 */
	public readonly enabled: boolean;
	/**
	 * A few examples to describe how to use the command
	 */
	public readonly examples: string[];
	/**
	 * Amount of exp granted when using the command
	 */
	public readonly exp: number;
	/**
	 * Instantiating command handler
	 */
	public readonly handler: CommandHandler;
	/**
	 * Abosulute path of the command
	 */
	public location: string;
	/**
	 * Name of the command
	 */
	public readonly name: string;
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
	 * Instantiates a new command
	 */
	protected constructor(handler: CommandHandler, {
		aliases = [],
		clientPermissions = [],
		coins = 10,
		cooldown = 5000,
		enabled = true,
		description,
		examples,
		exp = 850,
		name,
		usage,
		permLevel = PermLevels.EVERYONE,
	}: ICommandInfo) {
		// Assert correct type
		if (!(handler instanceof CommandHandler)) {
			throw new TypeError(`Command ${this.constructor.name}'s handler is not instanceof CommandHandler!`);
		}
		if (!(aliases instanceof Array)) {
			throw new TypeError(`Command ${this.constructor.name}'s aliases is not instanceof array!`);
		}
		if (!(clientPermissions instanceof Array)) {
			throw new TypeError(`Command ${this.constructor.name}'s clientPermissions is not instanceof array!`);
		}
		if (!description) {
			throw new Error(`Command ${this.constructor.name} does not have a description!`);
		}
		if (!(examples instanceof Array)) {
			throw new TypeError(`Command ${this.constructor.name}'s examples is not instanceof array!`);
		}
		if (!name) {
			throw new Error(`Command ${this.constructor.name} does not have a name!`);
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
		this.coins = coins;
		this.cooldown = cooldown;
		this.enabled = enabled;
		this.description = description;
		this.examples = examples;
		this.exp = exp;
		this.name = name;
		this.resolver = handler.resolver;
		this.usage = usage;
		this.permLevel = permLevel;
	}

	/**
	 * Should be overriden if custom re-requiring or other resource freeing action is required.
	 * @virtual
	 */
	public async free(): Promise<void> {
		delete require.cache[require.resolve(this.location)];
	}

	/**
	 * Should be overriden if parsing and validating args is required.
	 * Should return a string with a message to the user if resolving failed.
	 * @virtual
	 */
	// tslint:disable:no-any
	public parseArgs(message: Message, args: string[], info: ICommandRunInfo): Promise<any[] | string> | any[] | string {
		return args;
	}

	/**
	 * Main entry point for the actual execution of the command.
	 */
	public abstract run(message: Message, args: any[], info: ICommandRunInfo): any;
}
