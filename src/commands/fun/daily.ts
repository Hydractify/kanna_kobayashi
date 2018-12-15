import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { Emojis } from '../../types/Emojis';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class DailyCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['dailies'],
			// One day 24 hours * 60 minutes * 60 second * 1000 milliseconds
			cooldown: 24 * 60 * 60 * 1000,
			description: 'Your daily 200 coins!',
			examples: ['daily'],
			exp: 0,
			usage: 'daily',
		});
	}

	public async run(message: Message, _: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		await Promise.all([
			this.redis.hincrby(`users:${message.author.id}`, 'coins', 200),
			authorModel.increment({ coins: 200 }),
		]);

		return message.reply(`here are your daily **200** ${Emojis.Coin}!`);
	}
}

export { DailyCommand as Command };
