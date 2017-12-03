import { Collection, CollectorFilter, Message, Snowflake } from 'discord.js';
import { RedisClient } from 'redis-p';
import { col, fn, Sequelize, Transaction, where } from 'sequelize';
import { Model } from 'sequelize-typescript';

import { Item } from '../../models/Item';
import { User } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { Redis } from '../../util/RedisDecorator';
import { Sequelize as SequelizeDecorator } from '../../util/SequelizeDecorator';

@Redis
@SequelizeDecorator
class MarketCommand extends Command {

	private readonly redis: RedisClient;
	private readonly sequelize: Sequelize;

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['shop'],
			coins: 0,
			description: 'You can buy items or badges here.',
			examples: ['market buy some item'],
			exp: 0,
			name: 'market',
			usage: 'market <\'buy\'> <>',
		});
	}

	public parseArgs(message: Message, args: string[]): string | string[] {
		if (!args.length) return `you must provide a method! (**\`${this.usage}\`**)`;
		if (args[0].toLowerCase() !== 'buy') return `**${args[0]}** is not a method!`;

		return args.slice(1);
	}

	public async run(
		message: Message,
		args: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const item: Item = await Item.findOne<Item>({
			include: [{
				as: 'holders',
				model: User,
				through: { attributes: ['count'] },
				required: false,
				where: { id: message.author.id },
			}],
			// tslint:disable-next-line:no-any
			where: where(fn('lower', col('name')), args.join(' ').toLowerCase()) as any,
		});

		if (!item) return message.reply('I could not find an item or badge with that name!');
		if (!item.buyable) {
			return message.reply(`the **${item.name}** ${item.type.toLowerCase()} is not to buy!`);
		}

		const [already]: Item[] = await authorModel.$get<Item>(
			`${item.type.toLowerCase()}s`,
			{ where: { id: item.id } },
		) as Item[];

		if (item.unique && already) {
			return message.reply(`you already own the unique **${item.name}** ${item.type.toLowerCase()}!`);
		}

		await message.channel.send([
			`Is the **${item.name}** ${item.type.toLowerCase()} the one you are looking for, ${message.author}?`
			+ ' <:KannaTea:366019180203343872>',
			`That would cost you ${item.price} coins.`,
			'(Answer with **Y**es or **N**o)',
		]);

		const filter: CollectorFilter = (msg: Message): boolean => msg.author.id === message.author.id
			&& /^(y|n|yes|no)/i.test(msg.content);

		const confirmation: Message = await message.channel.awaitMessages(filter, { time: 1e4, max: 1 })
			.then((collected: Collection<Snowflake, Message>) => collected.first());

		if (!confirmation) {
			return message.channel.send([
				`${message.author}... as you did not tell me yes or no,`,
				'I had to cancel the command <:FeelsKannaMan:341054171212152832>',
			].join(' '));
		}

		if (/^(y|yes)/i.test(confirmation.content)) {
			if (authorModel.coins < item.price) {
				return message.reply('you do not have enough coins to buy that item! <:KannaWtf:320406412133924864>');
			}

			const transaction: Transaction = await this.sequelize.transaction();

			const promises: PromiseLike<Model<{}>>[] = [authorModel.increment({ coins: -item.price }, { transaction })];

			if (already) promises.push(already.userItem.increment('count', { transaction }));
			else promises.push(authorModel.$add(`${item.type.toLowerCase()}s`, item, { transaction }));

			await Promise.all(promises);
			await this.redis.hincrby(`users:${message.author.id}`, 'coins', -item.price);

			await transaction.commit();

			return message.reply([
				`you successfully bought the following ${item.type.toLowerCase()}: ${item.name}!`,
				already ? `You now own ${already.userItem.count} of them!` : '',
			].join('\n'));
		}

		return message.reply('canceling command... <:FeelsKannaMan:341054171212152832>');
	}
}

export { MarketCommand as Command };
