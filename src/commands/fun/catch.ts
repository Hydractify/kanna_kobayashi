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
			usage: 'catch',
		});
	}

	public async parseArgs(message: Message, args: string[], { authorModel }: ICommandRunInfo): Promise<string | Item[]> {
		const [net]: Item[] = await authorModel.$get<Item>('items', { where: { name: Items.BUG_NET } }) as Item[];

		if (!net || !net.getCount()) return 'You must have at least one Bug Net to use this command!';
		return [net];
	}

	public async run(message: Message, item: Item[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		let bugAmount: number = 0;
		let netBreak: boolean = false;

		const breakChance: number = Math.floor(Math.random() * 1000);
		const bugChance: number = Math.floor(Math.random() * 100);

		if (bugChance === 100) {
			bugAmount = 6;
			netBreak = Boolean(breakChance > 445);
		} else if (bugChance > 90) {
			bugAmount = 5;
			netBreak = Boolean(breakChance > 500);
		} else if (bugChance > 80) {
			bugAmount = 4;
			netBreak = Boolean(breakChance > 550);
		} else if (bugChance > 70) {
			bugAmount = 3;
			netBreak = Boolean(breakChance > 635);
		} else if (bugChance > 60) {
			bugAmount = 2;
			netBreak = Boolean(breakChance > 700);
		} else if (bugChance > 50) {
			bugAmount = 1;
			netBreak = Boolean(breakChance > 850);
		}

		const transaction: Transaction = await this.sequelize.transaction();
		try {
			await Promise.all([
				netBreak ? authorModel.addItem(Items.BUG_NET, -1, { transaction }) : null,
				authorModel.addItem(Items.BUG, bugAmount, { transaction }),
				authorModel.save({ transaction }),
			]);

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();

			throw error;
		}

		return message.channel.send([
			`You ${bugAmount ? `got **${bugAmount}** bugs!` : 'did not get any bugs...'}`,
			`And your Bug Net ${netBreak ? 'broke...' : 'did not break!'} <a:kannaRun:458776024012947456>`,
		].join(' '));
	}
}

export { CatchCommand as Command };
