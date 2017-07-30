const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class Rain extends Command {
  constructor() {
    super({
      alias: ['droplets'],
      name: 'rain',
      enabled: true
    });
  }

  async run(message, color) {
    let image = require('../../data/links').memes.rain;

    await message.channel.send({embed : meme(image, color, message)});
  }
}
