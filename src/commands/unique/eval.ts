import * as Discord from 'discord.js';
import { inspect, InspectOptions } from 'util';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';

class EvalCommand extends Command 
{
	/**
	 * Options used to inspect eval output with
	 */
	private _inspect: InspectOptions = { depth: 0 };

	public constructor(handler: CommandHandler) 
	{
		super(handler, {
			aliases: ['evaluate', 'broadcasteval', 'beval'],
			cooldown: 0,
			description: 'Evaluate arbitrary JavaScript code',
			examples: ['eval 1+1'],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.DEV,
			usage: 'eval <...string>',
		});
	}

	public async run(message: GuildMessage, args: string[], { commandName, authorModel }: ICommandRunInfo): Promise<Discord.Message | Discord.Message[]> 
	{
		let code: string = args.join(' ');
		if (code.includes('await')) code = `(async()=>{${code}})()`;
		try 
		{
			let evaled: any = ['broadcasteval', 'beval'].includes(commandName)
				? await this.client.shard!.broadcastEval(code)
				// tslint:disable-next-line:no-eval
				: await eval(code);

			if (typeof evaled !== 'string') evaled = inspect(evaled, this._inspect);

			if (evaled.length > 1990) 
			{
				return await message.channel.send(
					'Result is too long, sending as file instead.',
					new Discord.MessageAttachment(Buffer.from(evaled), 'file.txt'),
				);
			}

			return await message.channel.send(evaled || '\u200b', { code: 'js' });
		}
		catch (error) 
		{
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

	protected get depth(): number 
	{
		return this._inspect.depth!;
	}
	protected set depth(value: number) 
	{
		this._inspect.depth = value;
	}
}

export { EvalCommand as Command };
