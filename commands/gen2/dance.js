const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class Dance extends Command {
  constructor() {
    super({
      alias: ['flop'],
      name: 'dance',
      enabled: true
    });
  }

  async run(message, color) {
    let img = require('../../data/links').memes.dance[Math.floor(Math.random() * require('../../data/links').memes.dance.length)];

    await message.channel.send({embed : meme(img, color, message)});
  }
}
