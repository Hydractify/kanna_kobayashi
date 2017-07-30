const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class ForEver extends Command  {
  constructor() {
    super({
      alias: ['bosssleeppls'],
      name: 'sleep',
      enabled: true
    });
  }

  async run(message, pinku) {
    let image = require('../../data/links.json').memes.sleep;

    await message.channel.send({embed : meme(image, pinku, message)});
  }
}
