import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { PermLevels } from '../../types/PermLevels';
import { IPCMessageType } from '../../types/IPCMessageType';

class RestartCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			description: 'Restarts Kanna!\nEither a single shard or all of them.',
			examples: ['restart', 'restart 1'],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.TRUSTED,
			usage: 'restart [ShardID]',
		});
	}

	public async run(message: GuildMessage, [shardString]: string[]): Promise<void | Message>
	{
		if (!shardString)
		{
			await message.reply('Restarting!');
			return this.client.shard?.send({ __kanna__: true, type: IPCMessageType.RESTART_ALL });
		}

		const shardID: number = parseInt(shardString);
		if (isNaN(shardID)) return message.reply('you must provide me a number!');
		else if (shardID > (this.client.shard!.count - 1)) return message.reply('that is not a valid shard id!');

		await message.reply(`restarting shard ${shardID}!`);
		return this.client.shard?.send({ __kanna__: true, type: IPCMessageType.RESTART, target: shardID });
	}
}

export { RestartCommand as Command };
