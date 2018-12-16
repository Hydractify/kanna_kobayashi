import { Message } from 'discord.js';
import { Transaction } from 'sequelize';

import { Item } from '../../models/Item';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { Items } from '../../types/Items';

class CatchCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['bughunt'],
			description: 'Grab your Bug Net and let\'s go catch some bugs!',
			examples: ['catch'],
			exp: 0,
			usage: 'catch',
		});
	}

	public async run(message: Message, item: Item[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		let bugAmount: number = 0;

		const bugChance: number = Math.floor(Math.random() * 100) + 1;

		if (bugChance === 100) {
			bugAmount = 6;
		} else if (bugChance > 90) {
			bugAmount = 5;
		} else if (bugChance > 80) {
			bugAmount = 4;
		} else if (bugChance > 70) {
			bugAmount = 3;
		} else if (bugChance > 60) {
			bugAmount = 2;
		} else if (bugChance > 50) {
			bugAmount = 1;
		}

		if (bugAmount) {
			const transaction: Transaction = await this.sequelize.transaction();
			try {
				await Promise.all<number | null>([
					bugAmount ? authorModel.addItem(Items.BUG, bugAmount, { transaction }) : null,
				]);

				await transaction.commit();
			} catch (error) {
				await transaction.rollback();

				throw error;
			}
		}

		return message.channel.send(`You ${bugAmount ? `got **${bugAmount}** bugs! 🐛` : 'did not get any bugs...'}`);
	}
}

export { CatchCommand as Command };
