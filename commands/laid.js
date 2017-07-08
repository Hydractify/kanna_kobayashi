const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Laid extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['paid', 'dragonmaid'],
      category: 'gen3',
      name: 'laid'
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.laid;

    await message.channel.send({embed : embed.meme(image, pinku, message)});
  }
}
