const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Rain extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['droplets'],
      category: 'gen2',
      name: 'rain'
    });
  }

  async run(client, message, color)
  {
    let image = require('../util/links').memes.rain;

    await message.channel.send({embed : embed.meme(image, color, message)});
  }
}
