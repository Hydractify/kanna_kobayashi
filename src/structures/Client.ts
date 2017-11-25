import { Client as DJSClient, ClientOptions, Util } from 'discord.js';
import { join } from 'path';
import { post } from 'snekfetch';

import { User } from '../models/User';
import { generateColor } from '../util/generateColor';
import { ListenerUtil } from '../util/ListenerUtil';
import { Loggable } from '../util/LoggerDecorator';

const { on, once, registerListeners }: typeof ListenerUtil = ListenerUtil;

/**
 * Extended discord.js client
 */
@Loggable
export class Client extends DJSClient {

	private _commandHandler: CommandHandler;

	/**
	 * Instantiate the client
	 */
	public constructor(options: ClientOptions) {
		super(options);

		this._commandHandler = new CommandHandler(this);
		this._commandHandler.loadCommandsIn(join(__dirname, '..', 'commands'));

		registerListeners(this);
	}

	public color(user: User): number {
		if (user) {
			if (user.type === 'DEV') return 0x00000F;
			if (user.type === 'TRUSTED') return 0xFFFFFF;
		}

		return generateColor();
	}
}
