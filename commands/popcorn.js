const Command = require('../engine/commandClass');
const embeds = require('../util/embeds');

module.exports = class Popcorn extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['dreck'],
      name: 'popcorn',
      category: 'gen4',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let image = require('../util/links').memes.popcorn;

    await message.channel.send({embed : embeds.meme(image, color, message)});
  }
}
