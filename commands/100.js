const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class OneHundred extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['onehundred'],
      category: 'gen3',
      name: '100',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let image = require('../util/links').memes.onehundred;

    await message.channel.send({embed : embed.meme(image, color, message)});
  }
}
