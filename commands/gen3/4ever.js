const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class ForEver extends Command {
  constructor() {
    super({
      alias: ['forever'],
      name: '4ever',
      enabled: true
    });
  }

  async run(message, pinku) {
    let image = require('../../data/links').memes.forever;
    await message.channel.send({  embed : meme(image, pinku, message) });
  }
}
