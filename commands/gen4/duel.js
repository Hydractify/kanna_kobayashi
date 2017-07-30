const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class ForEver extends Command  {
  constructor() {
    super({
      alias: ['blueeyedragon'],
      name: 'duel',
      enabled: true
    });
  }

  async run(message, pinku) {
    let image = require('../../data/links.json').memes.duel;

    await message.channel.send({embed : meme(image, pinku, message)});
  }
}
