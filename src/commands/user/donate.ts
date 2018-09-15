import { GuildMember, Message, User } from 'discord.js';
import { Transaction } from 'sequelize';

import { Item } from '../../models/Item';
import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { Emojis } from '../../types/Emojis';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { resolveAmount } from '../../util/Util';

class DonateCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['give', 'transfer', 'trade'],
			description: 'Give money to someone!',
			examples: [
				'give wizard bug net',
				'give wizard 1000', 'give wizard 1k',
				'give wizard 1000000', 'give wizard 1k',
				'give wizard 1000000000', 'give wizard 1b',
				'give wizard 1234', 'give wizard 1k234',
			],
			usage: 'donate <User> <Item|Amount> [Amount]',
		});
	}

	public async parseArgs(
		message: Message,
		[input, ...itemAndAmount]: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<string | [User, number] | [User, Item, number]> {
		if (!input) return `you must give me a user! (\`${this.usage}\`)`;
		if (!itemAndAmount.length) return `you must give me an amount or item to donate! (\`${this.usage}\`)`;

		const target: User = await this.resolver.resolveMember(input, message.guild, false)
			.then((member: GuildMember) => member
				? member.user
				: this.resolver.resolveUser(input, false),
			);
		if (!target) return `I could not find a non bot user with the name or id ${input}.`;
		const [, itemName, amount]: RegExpMatchArray = itemAndAmount.join(' ').match(/([^\d]*?(?= *(?:\d|$))) *(.*)/);

		let item: Item = null;
		if (itemName) {
			item = await Item.findById(itemName.toLowerCase());
			if (!item) return `no such item "${itemName}"!`;
			[item] = await authorModel.$get<Item>('items', { where: { name: item.name } }) as Item[];
			if (!item || item.getCount() <= 0) return `you do not have ${itemName}!`;
			if (!item.tradable) return 'you may not donate this untradable item!';
			if (item.unique && await item.$has('holder', target.id)) return `**${target.tag}** already own this unique item!`;
		}

		const targetAmount: number = resolveAmount(item ? amount || '1' : amount);
		if (isNaN(targetAmount)) return 'that does not look like a valid number!';
		if (targetAmount <= 0) return 'the amount has to be positive!';
		if (authorModel.coins < targetAmount) return 'you do not have that amount of coins!';

		if (item) {
			if (item.getCount() < targetAmount) return `you do not have **${targetAmount.toLocaleString()}** ${itemName}!`;

			return [target, item, targetAmount];
		}

		return [target, targetAmount];
	}

	public async run(
		message: Message,
		[target, itemOrAmount, amount]: [User, Item | number, number],
		commandInfo: ICommandRunInfo,
	): Promise<Message | Message[]> {
		if (typeof itemOrAmount === 'number') return this.runCoins(message, [target, itemOrAmount], commandInfo);
		return this.runItem(message, [target, itemOrAmount, amount], commandInfo);
	}

	private async runCoins(
		message: Message,
		[target, amount]: [User, number],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const transaction: Transaction = await this.sequelize.transaction();
		const targetModel: UserModel = await target.fetchModel();
		try {
			await Promise.all([
				authorModel.increment({ coins: -amount }, { transaction }),
				targetModel.increment({ coins: amount }, { transaction }),
			]);

			await this.redis
				.multi()
				.hincrby(`users:${message.author.id}`, 'coins', -amount)
				.hincrby(`users:${target.id}`, 'coins', amount)
				.exec();

			await transaction.commit();

			return message.reply(
				`You sucessfully transferred **${amount.toLocaleString()}** ${Emojis.Coin} to **${target.tag}**!`,
			);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	private async runItem(
		message: Message,
		[target, item, amount]: [User, Item, number],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const transaction: Transaction = await this.sequelize.transaction();
		const targetModel: UserModel = await target.fetchModel();
		try {
			await Promise.all([
				authorModel.addItem(item, -amount),
				targetModel.addItem(item, amount),
			]);

			await transaction.commit();

			return message.reply(
				`You successfully transferred **${amount.toLocaleString()}** ${item.name} to **${target.tag}**!`,
			);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}
}

export { DonateCommand as Command };
