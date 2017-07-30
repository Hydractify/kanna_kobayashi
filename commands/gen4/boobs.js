const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');
const image = require('../../data/links.json')

module.exports = class BOOBS extends Command  {
  constructor() {
    super({
      alias: ['bubs', 'b00bs'],
      name: 'boobs',
      enabled: true
    });
  }

  async run(message, color) {
    let arr = image.memes.boobs;
    let img = arr[Math.floor(Math.random() * arr.length)];

    await message.channel.send({embed : meme(img, color, message)});
  }
}
