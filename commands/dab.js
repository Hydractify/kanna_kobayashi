const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Dab extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['dabu'],
      name: 'dab',
      category: 'gen1',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let image = require('../util/links').memes.dab;

    await message.channel.send({embed : embed.meme(image, color, message)});
  }
}
