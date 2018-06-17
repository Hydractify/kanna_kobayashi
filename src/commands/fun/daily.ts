import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class DailyCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['dailies'],
			// One day 24 hours * 60 minutes * 60 second * 1000 milliseconds
			cooldown: 24 * 60 * 60 * 1000,
			description: 'Your daily 200, or if you voted 214, coins!',
			examples: ['daily'],
			name: 'daily',
			usage: 'daily',
		});
	}

	public async run(message: Message, _: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const amount: number = authorModel.voted ? 214 : 200;
		await Promise.all([
			this.redis.hincrby(`users:${message.author.id}`, 'coins', amount),
			authorModel.increment({ coins: amount }),
		]);

		return message.reply(`here are your daily **${amount}** <:coin:330926092703498240>!`);
	}
}

export { DailyCommand as Command };
