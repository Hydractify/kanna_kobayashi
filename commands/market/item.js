const Command = require('../../structures/Command');
const ItemModel = require('../../models/Item');
const { inspect } = require('util');

class ItemCommand extends Command {
  constructor(handler) {
    super(handler, {
      coins: 0,
      exp: 0,
      name: 'item',
      usage: 'item <Method[Obligatory]> <Parameters[Obligatory]>',
      permLevel: 0,
      description: 'Check an Item information, give an item to your friend ~~or make an item if you are a developer~~!'
    });
  }

  async run(message, args) {
    if (!args[0]) {
      await message.reply(`you must provide a method! (**\`${this.usage}\`**)`);
      return;
    }
    this.message = message;
    this.args = args;
    const User = await message.author.fetchModel();

    if (args[0] === 'make') {
      if (User.type !== 'DEV') {
        await message.reply('only developers can make or update Items! <:KannaOmfg:315264558279426048>');
        return;
      }
      await this._make()
    }
  }

  async _make() {
    if (!this.args[1]) {
      await this.message.reply(`you must provide the parameters! (Object)`);
      return;
    }
    if (this.args[1] === 'structure') {
      await this.message.channel.send(`{
        name: STRING,
        type: ['BADGE', 'ITEM'],
        rarity: ['?', 'LIMITED', 'IMM', 'CH', 'HM', 'DSIZE', 'UR', 'R', 'UC', 'C'],
        buyable: BOOLEAN,
        price: INTEGER\n}`, {code: 'js'});
      return;
    }

    this.args.splice(0, 1);
    const UserObject = eval('(' + this.args.join(' ') + ')');
    if (typeof UserObject !== 'object') {
      await this.message.reply(`the evaluation must result in an Object! (Use \`kanna item make structure\` for its structure)`);
      return;
    }

    const Item = await ItemModel.findOne({
      where: {
        name : UserObject.name
      }
    });

    if (Item === null) {
      await ItemModel.create(UserObject);
      let model = await ItemModel.findOne({where : UserObject});
      await this.message.channel.send(`${this.message.author}! I have sucessfully created the Model! Here it is... <:KannaAyy:315270615844126720>\n`
      + '```js\n'
      + inspect(model.dataValues)
      + '\n```');
    } else {
      let model = await ItemModel.findOne({where : UserObject});
      await this.message.channel.send(`${this.message.author}! I have sucessfully updated the Model! Here it is... <:KannaAyy:315270615844126720>\n`
      + '```js\n'
      + inspect(model.dataValues)
      + '\n```');
    }
  }
}

module.exports = ItemCommand;
