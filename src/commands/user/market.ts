import { Message, MessageReaction, User } from 'discord.js';
import { Transaction } from 'sequelize';

import { Item } from '../../models/Item';
import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IResponsiveEmbedController } from '../../types/IResponsiveEmbedController';
import { ItemRarities } from '../../types/ItemRarities';
import { Items } from '../../types/Items';
import { titleCase } from '../../util/Util';

type Method = 'buy' | 'sell' | 'show' | 'list';

class MarketCommand extends Command implements IResponsiveEmbedController {
	public emojis: string[] = ['🔘', '⬅', '➡'];

	/**
	 * The Command's methods.
	 */
	// Can not be Method[] because ts is a bit too picky with Array#includes then
	private methods: string[] = ['buy', 'sell', 'show', 'list'];

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['store'],
			clientPermissions: ['ADD_REACTIONS', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY'],
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
			usage: 'market [\'buy\'|\'sell\'|\'show\'|Item] [Item] [Count]',
		});
	}

	public async parseArgs(
		message: Message,
		args: string[],
	): Promise<string | [string, Item, number | undefined] | [string]> {
		const [input, ...item] = args.join(' ').toLowerCase().split(' ');
		if (!input || input.toLowerCase() === 'list') return ['list'];

		let resolvedItem: Item | null;
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
		if (!resolvedItem) return `**${item.join(' ')}** is not an item!`;

		if (count <= 0) {
			return `please provide a positive amount of items to ${input}.`;
		}

		return [input, resolvedItem, count];
	}

	public async onCollect({ emoji, message, users }: MessageReaction, user: User): Promise<Message | undefined> {
		users.remove(user).catch(() => undefined);
		// tslint:disable-next-line:prefer-const
		let [, type, rawIndex]: RegExpMatchArray = /Kanna's Market (?:.+ )?\(?(.+)\) \| Page (\d+)/
			.exec(message.embeds[0].title) || [];
		let index: number = parseInt(rawIndex) - 1;
		if (!type || !rawIndex || isNaN(index)) return;
		type = type[0].toLowerCase() + type.slice(1, -1);
		let superior: boolean = type === 'scale';

		if (emoji.name === '➡') {
			if (!message.embeds[0].fields.length) return;
			++index;
		} else if (emoji.name === '⬅') {
			if (index <= 0) return;
			--index;
		} else if (emoji.name === '🔘') {
			superior = !superior;
			index = 0;
		}

		const items: Item[] = await Item
			.scope(superior ? 'scale' : 'coin')
			.findAll({
				limit: 10,
				offset: index * 10,
				where: {
					buyable: true,
				},
			});

		message.edit(
			await this._buildEmbed(user, index, items, superior),
		);
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
					`You need ${(item.price - (scale ? scale.getCount() : 0)).toLocaleString()} more.`,
				].join('\n'));
			}

			await this.sequelize.transaction(async (transaction: Transaction) =>
				Promise.all([
					authorModel.addItem(item, count, { transaction }),
					authorModel.addItem(Items.DRAGON_SCALE, -item.price, { transaction }),
				]),
			);
		} else {
			if ((item.price * count) > authorModel.coins) {
				return message.reply([
					'you have insufficient coins to buy this item!',
					`You need ${(item.price * count - authorModel.coins).toLocaleString()} more.`,
				].join('\n'));
			}

			const transaction: Transaction = await this.sequelize.transaction();
			try {
				authorModel.coins -= item.price * count;
				await Promise.all([
					authorModel.addItem(item, count, { transaction }),
					authorModel.save({ transaction }),
				]);

				await transaction.commit();
			} catch (error) {
				authorModel.coins += item.price * count;
				await transaction.rollback();

				throw error;
			}
		}

		return message.reply(`thank you for buying **${count} ${titleCase(item.name)}**!`);
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
		if (!userItem) return message.reply(`you do not own the **${item.name}** ${item.type.toLowerCase()}`);
		if (userItem.getCount() < count) {
			return message.reply(
				`you only have **${userItem.getCount()}** of the **${userItem.name}** ${item.type.toLowerCase()}!`,
			);
		}

		const transaction: Transaction = await this.sequelize.transaction();
		try {
			authorModel.coins += item.price * count;
			await Promise.all([
				authorModel.addItem(item, -count, { transaction }),
				authorModel.save({ transaction }),
			]);

			await transaction.commit();
		} catch (error) {
			authorModel.coins -= item.price * count;
			await transaction.rollback();

			throw error;
		}

		return message.reply(`thank you for selling **${count} ${titleCase(item.name).toLowerCase()}**!`);
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

	protected async list(
		message: Message,
		item: Item,
		count: number,
		authorModel: UserModel,
	): Promise<Message> {
		const items: Item[] = await Item
			.scope('coin')
			.findAll({
				limit: 10,
				where: {
					buyable: true,
				},
			});

		const marketMessage: Message = await message.channel.send(
			await this._buildEmbed(message.author, 0, items, false),
		) as Message;

		for (const emoji of this.emojis) await marketMessage.react(emoji);

		return marketMessage;
	}

	private async _buildEmbed(
		author: User,
		index: number,
		items: Item[],
		superior: boolean,
	): Promise<MessageEmbed> {
		const embed: MessageEmbed = MessageEmbed.common({ author }, await author.fetchModel())
			.setTitle(`Kanna\'s Market (${superior ? 'Dragon Scales' : 'Coins'}) | Page ${index + 1}`);

		embed.footer.text += ' | Market';

		if (!items.length) return embed.setDescription('Nothing to see here, you maybe want to go back.');

		for (const item of items) {
			embed.addField(`${titleCase(item.name)}`, [
				`Price: ${item.price ? item.price : 'n/a'}`,
				`Rarity: ${titleCase(ItemRarities[item.rarity].replace(/_/, ' '))}`,
				`Type: ${titleCase(item.type.toLowerCase())}`,
			].join('\n'), true);
		}

		return embed;
	}
}

export { MarketCommand as Command };
