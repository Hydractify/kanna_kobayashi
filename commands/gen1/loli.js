const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class Loli extends Command {
  constructor() {
    super({
      alias: ['callpoliceplscuziamalolicon'],
      category: 'gen1',
      name: 'loli',
      enabled: true
    });
  }

  async run(message, pinku) {
    let image = require('../../data/links.json').memes.loli;
    image = image[Math.floor(Math.random() * image.length)];

    await message.channel.send('<:woa:315264558413381646>  Hmm... A hooman', {embed : meme(image, pinku, message)});
  }
}
