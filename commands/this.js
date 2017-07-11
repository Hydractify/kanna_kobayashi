const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class This extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['dis'],
      category: 'gen3',
      name: 'this',
      enabled: true
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.this;

    await message.channel.send({embed : embed.meme(image, pinku, message)});
  }
}
