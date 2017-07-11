const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class OneHundred extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['inhales'],
      category: 'gen3',
      name: 'scream',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let image = require('../util/links').memes.scream;

    await message.channel.send({embed : embed.meme(image, color, message)});
  }
}
