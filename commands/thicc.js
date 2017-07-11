const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Thicc extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['rawr'],
      category: 'gen3',
      name: 'thicc',
      enabled: true
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.thicc;

    await message.channel.send({embed : embed.meme(image, pinku, message)});
  }
}
