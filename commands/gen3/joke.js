const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme');

module.exports = class Joke extends Command {
  constructor() {
    super({
      alias: ['jk'],
      name: 'joke',
      enabled: true
    });
  }

  async run(message, color) {
    let i = require('../../data/links').memes.joke;
    let image = i[Math.floor(Math.random() * i.length)];

    await message.channel.send({embed : meme(image, color, message)});
  }
}
