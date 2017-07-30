const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class Ten extends Command  {
  constructor() {
    super({
      alias: ['10'],
      name: 'ten',
      enabled: true
    });
  }

  async run(message, pinku) {
    let image = require('../../data/links.json').memes.ten;

    await message.channel.send({embed : meme(image, pinku, message)});
  }
}
