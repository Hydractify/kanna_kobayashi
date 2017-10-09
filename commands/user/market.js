const Item = require('../../models/Item');
const { col, fn, where } = require('sequelize');
const User = require('../../models/User');

const Command = require('../../structures/Command');

class Market extends Command {
  constructor(handler) {
    super(handler, {
      aliases: ['shop'],
      coins: 0,
      cooldown: 0,
      description: 'Shows stats about the bot.',
      examples: ['stats'],
      exp: 0,
      name: 'market',
      usage: 'market <Method> <>',
      permLevel: 0
    });
  }

  async run(message, [method, ...args]) {
    if (!method) {
      return message.reply(`you must provide a method! (**\`${this.usage}\`**)`);
    }
    switch(method) {
      case 'buy':
      this.buy(message, args);
      break;

      default:
      return message.reply(`**${method}** is not a method!`);
    }
  }

  async buy(message, args) {
    const userModel = message.author.model || await message.author.fetchModel();

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
		if (!item) return message.channel.send(`${message.author}, could not find an item with that name!`);
    if (!item.buyable) return message.channel.send(`That item is unbayable ${message.author}!`)

    await message.channel.send([
      `Is the item **${item.name}** that you want ${message.author}? <:KannaTea:366019180203343872>`,
      '(Answer with *Y*es or **N**o)'
    ]);
    const MessagesReceived = await message.channel.awaitMessages((m) => m.content.toLowerCase().includes(['yes', 'no']) || m.content.toLowerCase() === ('y' || 'n'), { time: 10000, maxMatches: 1 });

    if (MessagesReceived.size) {
      if (MessagesReceived.first() === 'yes') {
        if (userModel.coins < item.price) return message.reply(`you don't have sufficient coins to buy that item! <:KannaWtf:320406412133924864>`);
        userModel.coins -= item.price;
      } else {
        return message.channel.send(`Ok... Canceling command <:FeelsKannaMan:341054171212152832>`);
      }
    } else {
      return message.channel.send(`${message.author}... As you didn't told me yes or no, i have cancelled the command <:FeelsKannaMan:341054171212152832>`);
    }
  }
}

module.exports = Market;
