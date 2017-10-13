const Command = require('../../structures/Command');
const { instance: { db } } = require('../../structures/PostgreSQL');
const { instance: { db: redis } } = require('../../structures/Redis');

class DonateCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['give', 'transfer', 'trade'],
			coins: 0,
			description: 'Give money to someone!',
			examples: ['give wizard 1000'],
			exp: 0,
			name: 'donate',
			usage: 'donate <User> <Amount>',
			permLevel: 0
		});
	}

	async run(message, [input, amount]) {
		if (!input) return message.reply(`you must give me a user! (\`${this.usage}\`)`);
		if (!amount) return message.reply(`you must give me an amount! (\`${this.usage}\`)`);

		const mentionedUser = await this.handler.resolveUser(input, false);
		if (!mentionedUser) return message.reply(`could not find a non bot user with ${input}.`);

		const userAmount = parseInt(amount);
		if (isNaN(userAmount) || userAmount <= 0) {
			return message.reply('you must give me a valid amount, which must be a positive number!');
		}

		const [authorModel, mentionedModel] = await Promise.all([
			message.author.fetchModel(),
			mentionedUser.fetchModel()
		]);
		if (authorModel.coins < userAmount) return message.reply('you do not have that amount of money to donate!');

		const transaction = await db.transaction();

		await Promise.all([
			authorModel.increment({ coins: -amount }, { transaction }),
			mentionedModel.increment({ coins: amount }, { transaction })
		]);

		await redis
			.multi()
			.hincrby(`users::${message.author.id}`, 'coins', -amount)
			.hincrby(`users::${mentionedUser.id}`, 'coins', amount)
			.execAsync();

		await transaction.commit();

		return message.reply(`I sucessfully transferred **${amount}** <:coin:330926092703498240> to ${mentionedUser}!`);
	}
}

module.exports = DonateCommand;
