const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Joke extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['jk'],
      name: 'joke',
      category: 'gen3'
    });
  }

  async run(client, message, color)
  {
    let i = require('../util/links').memes.joke;
    let image = i[Math.floor(Math.random() * i.length)];

    await message.channel.send({embed : embed.meme(image, color, message)});
  }
}
