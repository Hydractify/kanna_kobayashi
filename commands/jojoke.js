const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class JoJoke extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['jjk'],
      name: 'jojoke',
      category: 'gen3',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let i = require('../util/links').memes.jojoke;
    let image = i[Math.floor(Math.random() * i.length)];

    await message.channel.send({embed : embed.meme(image, color, message)});
  }
}
