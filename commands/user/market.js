const { col, fn, where } = require('sequelize');

const Item = require('../../models/Item');
const User = require('../../models/User');
const Command = require('../../structures/Command');
const { instance: { db } } = require('../../structures/PostgreSQL');
const { instance: { db: redis } } = require('../../structures/Redis');
const { titleCase } = require('../../util/util');

class MarketCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['shop'],
			coins: 0,
			description: 'You can buy items or badges here.',
			examples: ['market buy some item'],
			exp: 0,
			name: 'market',
			// TODO: More methods?
			usage: 'market <Method> <>',
			permLevel: 0
		});
	}

	run(message, [method, ...args], { authorModel }) {
		if (!method) {
			return message.reply(`you must provide a method! (**\`${this.usage}\`**)`);
		}

		switch (method) {
			case 'buy':
				return this.buy(message, args, authorModel);

			default:
				return message.reply(`**${method}** is not a method!`);
		}
	}

	async buy(message, args, authorModel) {
		const item = await Item.findOne({
			include: [{
				as: 'holders',
				joinTableAttributes: ['count'],
				model: User,
				required: false,
				where: { id: message.author.id }
			}],
			where: where(fn('lower', col('name')), args.join(' ').toLowerCase())
		});

		if (!item) return message.reply('I could not find an item or badge with that name!');
		if (!item.buyable) {
			return message.reply(`the **${item.name}** ${item.type.toLowerCase()} is not to buy!`);
		}

		const [already] = await authorModel[`get${titleCase(item.type)}s`]({ where: { id: item.id } });

		if (item.unique && already) {
			return message.reply(`you already own the unique **${item.name}** ${item.type.toLowerCase()}!`);
		}

		await message.channel.send([
			`Is the **${item.name}** ${item.type.toLowerCase()} the one you are looking for, ${message.author}?`
			+ ' <:KannaTea:366019180203343872>',
			`That would cost you ${item.price} coins.`,
			'(Answer with **Y**es or **N**o)'
		]);

		const filter = msg => msg.author.id === message.author.id
			&& /^(y|n|yes|no)/i.test(msg.content);

		const collected = await message.channel.awaitMessages(filter, { time: 10000, maxMatches: 1 });

		if (!collected.size) {
			return message.channel.send([
				`${message.author}... as you did not tell me yes or no,`,
				'I had to cancel the command <:FeelsKannaMan:341054171212152832>'
			].join(' '));
		}

		if (/^(y|yes)/i.test(collected.first())) {
			if (authorModel.coins < item.price) {
				return message.reply('you do not have enough coins to buy that item! <:KannaWtf:320406412133924864>');
			}

			const transaction = await db.transaction();

			const promises = [authorModel.increment({ coins: -item.price }, { transaction })];

			if (already) promises.push(already.setItemCount(already.count + 1, { transaction }));
			else promises.push(authorModel[`add${titleCase(item.type)}`](item, { transaction }));

			await Promise.all(promises);
			await redis.hincrby(`users:${message.author.id}`, 'coins', -item.price);

			await transaction.commit();

			return message.reply([
				`you successfully bought the following ${item.type.toLowerCase()}: ${item.name}!`,
				already ? `You now own ${already.count} of them!` : ''
			].join('\n'));
		}

		return message.reply('canceling command... <:FeelsKannaMan:341054171212152832>');
	}
}

module.exports = MarketCommand;
