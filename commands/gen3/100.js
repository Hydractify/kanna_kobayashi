const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class OneHundred extends Command {
  constructor() {
    super({
      alias: ['onehundred'],
      name: '100',
      enabled: true
    });
  }

  async run(message, color) {
    let image = require('../../data/links').memes.onehundred;
    await message.channel.send({embed : meme(image, color, message)});
  }
}
