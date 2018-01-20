import { Message } from 'discord.js';
import { Model } from 'sequelize-typescript';

import { Item } from '../../models/Item';
import { User as UserModel } from '../../models/User';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { titleCase } from '../../util/Util';

class MarketCommand extends Command {
	/**
	 * The Command's methods.
	 */
	private methods: string[];

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['store'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			cooldown: 10000,
			description: 'This is the ~~black~~ market... Buy, sell, and see info about items and badges!',
			examples: [
				'market',
				'market buy Dragon Scale',
				'market sell Dragon Scale',
				'market Dragon Scale',
				'market show Dragon Scale',
			],
			exp: 0,
			name: 'market',
			usage: 'market []\'buy\'|\'sell\'|Item] [Item]',
		});
		this.methods = ['buy', 'sell', 'show', 'list'];
	}

	public async parseArgs(
		message: Message,
		[input, ...item]: string[],
	): Promise<string | [string, (string[] | Item)]> {
		if (!input || input === 'list') return ['list', item];

		let resolvedItem: Item;
		if (!this.methods.includes(input)) {
			resolvedItem = await Item.findById(input);
			if (!resolvedItem) return `**${input}** is not a valid method!`;

			return ['show', resolvedItem];
		}

		if (!item) return `you must provide an item! (\`${this.usage}\`)`;

		resolvedItem = await Item.findById(item.join(' '));
		if (!resolvedItem) return `**${item}** is not an item!`;

		return [input, resolvedItem];
	}

	public run(
		message: Message,
		[method, item, count]: [string, (string | Item), number],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		return this[method](message, item, count, authorModel);
	}

	public async buy(message: Message, item: Item, count: number, authorModel: UserModel): Promise<Message | Message[]> {
		if (!item.buyable) return message.reply('this is an unbuyable item!');

		const hasItem = await item.hasHolder(authorModel);
		if (item.unique && hasItem) {
			return message.reply(`you can only have one **${titleCase(item.name)}** ${titleCase(item.type.toLowerCase())}!`);
		}
		if (item.unique) count = 1;

		const superior: boolean = item.rarity > 5;
		if (superior) {
			const scale: Item = await Item.findById('dragon scale');

			const hasScale: boolean = await Item.hasHolder(authorModel);
			if (!hasScale) await authorModel.addItem(scale, 0);

			const userScales = (await authorModel.$get('items', { where: { name: 'Dragon Scale' } })).UserItem.dataValues;
			if (item.price > userScales.count) return message.reply('you have insufficient Dragon Scales to buy this item!');

			await authorModel.addItem(item, count);
			await authorModel.addItem(scale, -item.price);
		} else {
			if (item.price > authorModel.coins) return message.reply('you have insufficient coins to buy this item!');

			authorModel.coins -= item.price;
			await Promise.all([
				await authorModel.addItem(item, count),
				await authorModel.save(),
			]);
		}

		return message.reply(`thanks for buying **${count} ${titleCase(item.name)}**!`);
	}
}

export { MarketCommand as Command };
