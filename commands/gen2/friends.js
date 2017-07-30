const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class Friends extends Command {
  constructor() {
    super({
      alias: ['tomodachi'],
      name: 'friends',
      enabled: true
    });
  }

  async run(message, color) {
    let img = require('../../data/links').memes.friends;

    await message.channel.send({embed : meme(img, color, message)});
  }
}
