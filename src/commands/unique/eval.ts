import * as Discord from 'discord.js';
import { inspect, InspectOptions } from 'util';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import * as Osu from '../../structures/osu';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';
import { Redis } from '../../util/RedisDecorator';
import { Sequelize } from '../../util/SequelizeDecorator';

@Sequelize
@Redis
class EvalCommand extends Command {
	/**
	 * Options used to inspect eval output with
	 */
	private _inspect: InspectOptions = { depth: 0 };

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['evaluate', 'broadcasteval'],
			coins: 0,
			cooldown: 0,
			description: 'Evaluates arbitrary JavaScript code',
			examples: ['You should know how to use this.'],
			exp: 0,
			name: 'eval',
			permLevel: PermLevels.DEV,
			usage: 'eval <...string>',
		});

		Osu.Api();
	}

	public async run(message: Discord.Message, args: string[], { commandName }: ICommandRunInfo)
		: Promise<Discord.Message | Discord.Message[]> {
		let code: string = args.join(' ');
		if (code.includes('await')) code = `(async()=>{${code}})()`;
		try {
			let evaled: any = commandName === 'broadcasteval'
				? await this.client.shard.broadcastEval(code)
				// tslint:disable-next-line:no-eval
				: await eval(code);

			if (typeof evaled !== 'string') {
				evaled = inspect(evaled, this._inspect);
			}

			return message.channel.send(evaled || '\u200b', { code: 'js' });
		} catch (error) {
			return message.channel.send(
				[
					'**Error**',
					'```js',
					String(error),
					'```',
				],
			);
		}
	}

	private get depth(): number {
		return this._inspect.depth;
	}
	private set depth(value: number) {
		this._inspect.depth = value;
	}
}

export { EvalCommand as Command };
