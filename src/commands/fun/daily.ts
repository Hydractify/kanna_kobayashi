import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class DailyCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['dailies'],
			coins: 0,
			// One day 24 hours * 60 minutes * 60 second * 1000 milliseconds
			cooldown: 24 * 60 * 60 * 1000,
			description: 'Your daily 300 coins!',
			examples: ['daily'],
			name: 'daily',
			usage: 'daily',
		});
	}

	public async run(message: Message, _: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const grantedCoins: number = (authorModel.tier + 1) * 300;

		await Promise.all([
			this.redis.hincrby(`users:${message.author.id}`, 'coins', grantedCoins),
			authorModel.increment({ coins: grantedCoins }),
		]);

		return message.reply(`here are your daily **${grantedCoins}** <:coin:330926092703498240>!`);
	}
}

export { DailyCommand as Command };
