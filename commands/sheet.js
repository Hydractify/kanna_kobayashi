const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Sheet extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['shit'],
      category: 'gen2',
      name: 'sheet',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let image = require('../util/links').memes.sheet;

    await message.channel.send({embed : embed.meme(image, color, message)});
  }
}
