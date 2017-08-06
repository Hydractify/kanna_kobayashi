const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class Pregnant extends Command {
  constructor() {
    super({
      alias: ['fbi'],
      name: 'pregnant',
      enabled: true
    });
  }

  async run(message, color) {
    let image = require('../../data/links').memes.pregnant;
    let embed = meme(image, color, message);

    await message.channel.send(`Fear FBI **${message.member.displayName}**!`, {embed});
  }
}
