import { Client as DJSClient, ClientOptions, Util } from 'discord.js';
import { join } from 'path';
import { post } from 'snekfetch';

import { User } from '../models/User';
import { generateColor } from '../util/generateColor';
import { ListenerUtil } from '../util/ListenerUtil';
import { Loggable, Logger } from './Logger';

const { on, once, registerListeners }: typeof ListenerUtil = ListenerUtil;

/**
 * Extended discord.js client
 */
@Loggable
export class Client extends DJSClient {
	/**
	 * Command handler of the client
	 */
	public readonly commandHandler: CommandHandler;

	/**
	 * Reference to the logger
	 */
	private readonly logger: Logger;

	/**
	 * Instantiate the client
	 */
	public constructor(options: ClientOptions) {
		super(options);

		this.commandHandler = new CommandHandler(this);
		this.commandHandler.loadCommandsIn(join(__dirname, '..', 'commands'));

		registerListeners(this);
	}
}
