import { Message } from 'discord.js';
import { Transaction } from 'sequelize';

import { Item } from '../../models/Item';
import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { ItemRarities } from '../../types/ItemRarities';
import { Items } from '../../types/Items';
import { titleCase } from '../../util/Util';

type Method = 'buy' | 'sell' | 'show' | 'list';

class MarketCommand extends Command {
	/**
	 * The Command's methods.
	 */
	// Can not be Method[] because ts is a bit too picky with Array#includes then
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
			usage: 'market [\'buy\'|\'sell\'|\'show\'|Item] [Item] [Count]',
		});
		this.methods = ['buy', 'sell', 'show', 'list'];
	}

	public async parseArgs(
		message: Message,
		args: string[],
	): Promise<string | [string, Item, number] | [string]> {
		const [input, ...item] = args.join(' ').toLowerCase().split(' ');
		if (!input || input.toLowerCase() === 'list') return ['list'];

		let resolvedItem: Item;
		if (!this.methods.includes(input)) {
			resolvedItem = await Item.findById([input, ...item].join(' '));
			if (!resolvedItem) return `**${input}** is not a valid method!`;

			return ['show', resolvedItem, undefined];
		}

		if (!item) return `you must provide an item! (\`${this.usage}\`)`;

		// Parse the last entry to check for the optional number
		let count: number = parseInt(item[item.length - 1]);
		// No number -> default to one
		if (isNaN(count)) count = 1;
		// A number -> remove it from the args array
		else item.splice(-1, 1);

		resolvedItem = await Item.findById(item.join(' '));
		if (!resolvedItem) return `**${item}** is not an item!`;

		if (count <= 0) {
			return `please provide a positive amount of items to ${input}.`;
		}

		return [input, resolvedItem, count];
	}

	public run(
		message: Message,
		[method, item, count]: [Method, string[] | Item, number],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		return this[method](message, item as any, count, authorModel);
	}

	protected async buy(
		message: Message,
		item: Item,
		count: number,
		authorModel: UserModel,
	): Promise<Message | Message[]> {
		if (!item.buyable) {
			return message.reply(`**${titleCase(item.name)}** is an unbuyable ${item.type.toLowerCase()}!`);
		}

		if (item.unique) {
			if (await item.$has('holder', authorModel)) {
				return message.reply(`you can only have one **${titleCase(item.name)}** ${item.type.toLowerCase()}!`);
			}

			if (count !== 1) {
				return message.reply(
					`you can not buy more than one **${titleCase(item.name)}** ${item.type.toLowerCase()}!`,
				);
			}
		}

		if (item.rarity < 5) {
			const [scale]: Item[] = await authorModel.$get<Item>('items', { where: { name: Items.DRAGON_SCALE } }) as Item[];
			if (!scale || item.price > scale.getCount()) {
				return message.reply([
					'you have insufficient Dragon Scales to buy this item!',
					`You need ${item.price - scale.getCount()} more.`,
				].join('\n'));
			}

			await this.sequelize.transaction(async (transaction: Transaction) =>
				Promise.all([
					authorModel.addItem(item, count, { transaction }),
					authorModel.addItem(Items.DRAGON_SCALE, -item.price, { transaction }),
				]),
			);
		} else {
			if (item.price > authorModel.coins) {
				return message.reply([
					'you have insufficient coins to buy this item!',
					`You need ${item.price - authorModel.coins} more.`,
				].join('\n'));
			}

			const transaction: Transaction = await this.sequelize.transaction();
			try {
				authorModel.coins -= item.price;
				await Promise.all([
					authorModel.addItem(item, count, { transaction }),
					authorModel.save({ transaction }),
				]);

				await transaction.commit();
			} catch (error) {
				authorModel.coins += item.price;
				await transaction.rollback();

				throw error;
			}
		}

		return message.reply(`thanks for buying **${count} ${titleCase(item.name)}**!`);
	}

	protected async sell(
		message: Message,
		item: Item,
		count: number,
		authorModel: UserModel,
	): Promise<Message | Message[]> {
		if (!item.tradable) {
			return message.reply(`**${titleCase(item.name)}** is an unsellable ${item.type.toLowerCase()}`);
		}

		const [userItem]: Item[] = await authorModel.$get<Item>('items', { where: { name: item.name } }) as Item[];
		if (userItem.getCount() < count) {
			return message.reply(
				`you only have **${userItem.getCount()}** of the **${userItem.name}** ${titleCase(item.type).toLowerCase()}!`,
			);
		}

		const transaction: Transaction = await this.sequelize.transaction();
		try {
			authorModel.coins += item.price;
			await Promise.all([
				authorModel.addItem(item, -count, { transaction }),
				authorModel.save({ transaction }),
			]);

			await transaction.commit();
		} catch (error) {
			authorModel.coins -= item.price;
			await transaction.rollback();

			throw error;
		}

		return message.reply(`thanks for selling **${count} ${titleCase(item.name).toLowerCase()}**!`);
	}

	protected async show(
		message: Message,
		item: Item,
		count: number,
		authorModel: UserModel,
	): Promise<Message | Message[]> {
		const holderCount: number = await item.$count('holders') as any || 0;

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`${titleCase(item.name)}'s Info`, message.author.displayAvatarURL())
			.setDescription(item.description)
			.addField('Buyable', item.buyable ? 'Yes' : 'No', true)
			.addField('Price', item.price ? item.price.toLocaleString() : 'n/a', true)
			.addField('Rarity', titleCase(ItemRarities[item.rarity].toLowerCase()), true)
			.addField('Trade- or Sellable', item.tradable ? 'Yes' : 'No', true)
			.addField('Type', titleCase(item.type.toLowerCase()), true)
			.addField('Unique (May only have one)', item.unique ? 'Yes' : 'No', true)
			.addField('Total Holders', holderCount.toLocaleString(), true);

		return message.reply(embed);
	}

	protected list(message: Message, item: Item, count: number, authorModel: UserModel): never {
		throw new Error('stub');
	}
}

export { MarketCommand as Command };
