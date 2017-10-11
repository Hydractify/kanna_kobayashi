const Item = require('../../models/Item');
const User = require('../../models/User');
const Command = require('../../structures/Command');

class DonateCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['give', 'transfer'],
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
		if (!input) return message.reply(`you must give me an user! (\`${this.usage}\`)`);
		if (!amount) return message.reply(`you must give me an amount! (\`${this.usage}\`)`);
		
		const userAmount = parseInt(amount);
		if (isNaN(userAmount)) return message.reply('you must give me a valid number!');

		const authorModel = message.author.model || await message.author.fetchModel();
		if (authorModel.coins < userAmount) return message.reply('you don\'t have that amount of money to donate!');

		const mentionedUser = await this.handler.resolveUser(input, false);
		const mentionedModel = mentionedUser.model || await mentionedUser.fetchModel();

		mentionedModel.coins += amount;
		authorModel.coins -= amount;
		await authorModel.save();
		await mentionedModel.save();

		return message.channel.send(`Sucessfully transfered **${amount}** <:coin:330926092703498240> to ${mentionedUser}!`);
	}
}

module.exports = DonateCommand;