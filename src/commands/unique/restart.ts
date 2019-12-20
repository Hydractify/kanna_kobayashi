import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { PermLevels } from '../../types/PermLevels';

class RestartCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			description: 'Restarts Kanna!',
			examples: ['restart', 'restart 1'],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.TRUSTED,
			usage: 'restart [Number]',
		});
	}

	public async run(message: GuildMessage, [shardNumber]: string[]): Promise<Message | Message[]>
	{
		if (!shardNumber)
		{
			await message.reply('Restarting!');
			return this.client.shard!.broadcastEval('process.exit(0)');
		}

		const shard: number = parseInt(shardNumber);
		if (isNaN(shard)) return message.reply('you must provide me a number!');
		else if (shard > (this.client.shard!.count - 1)) return message.reply('that is not a valid shard!');

		await message.reply(`restarting shard ${shardNumber}!`);
		return this.client.shard!.broadcastEval(`if (this.shard.ids.includes[${shardNumber}]) process.exit(0)`);
	}
}

export { RestartCommand as Command };
