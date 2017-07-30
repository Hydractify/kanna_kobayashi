const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class Thicc extends Command  {
  constructor() {
    super({
      alias: ['rawr'],
      name: 'thicc',
      enabled: true
    });
  }

  async run(message, pinku) {
    let image = require('../../data/links.json').memes.thicc;

    await message.channel.send({embed : meme(image, pinku, message)});
  }
}
