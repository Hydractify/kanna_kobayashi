import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';

class RestartCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			coins: 0,
			description: 'Restarts Kanna!',
			examples: ['restart', 'restart 1'],
			exp: 0,
			permLevel: PermLevels.TRUSTED,
			usage: 'restart [Number]',
		});
	}

	public async run(message: Message, [shardNumber]: string[]): Promise<Message | Message[]> {
		if (!shardNumber) {
			await message.reply('Restarting!');
			return message.client.shard.broadcastEval('process.exit(0)');
		}

		const shard: number = parseInt(shardNumber);
		if (isNaN(shard)) return message.reply('You must provide me a number!');
		else if (shard > (message.client.shard.count - 1)) return message.reply('That is not a valid shard!');

		await message.reply(`Restarting shard ${shardNumber}!`);
		return message.client.shard.broadcastEval(`if (this.shard.id === ${shardNumber} process.exit(0)`);
	}
}

export { RestartCommand as Command };
