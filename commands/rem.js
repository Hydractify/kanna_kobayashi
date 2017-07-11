const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Rem extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['reimu'],
      category: 'gen4',
      name: 'rem',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let image = require('../util/links').memes.rem;

    await message.channel.send({embed : embed.meme(image, color, message)});
  }
}
