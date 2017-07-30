const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class Police extends Command {
  constructor() {
    super({
      alias: ['policepls'],
      name: 'police',
      enabled: true
    });
  }

  async run(message, color) {
    let image = require('../../data/links').memes.police;

    await message.channel.send('<:police:331923995278442497>', {embed : meme(image, color, message)});
  }
}
