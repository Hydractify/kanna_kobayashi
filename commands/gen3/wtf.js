const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class ForEver extends Command  {
  constructor() {
    super({
      alias: ['dafuk'],
      name: 'wtf',
      enabled: true
    });
  }

  async run(message, pinku) {
    let image = require('../../data/links.json').memes.wtf;

    await message.channel.send({embed : meme(image, pinku, message)});
  }
}
