const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class Popcorn extends Command  {
  constructor() {
    super({
      alias: ['dreck'],
      name: 'popcorn',
      enabled: true
    });
  }

  async run(message, color) {
    let image = require('../../data/links').memes.popcorn;

    await message.channel.send({embed : meme(image, color, message)});
  }
}
