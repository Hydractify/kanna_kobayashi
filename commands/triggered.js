const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Triggered extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['ydfuccudodistome'],
      category: 'gen1',
      name: 'triggered',
      enabled: true
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.triggered;

    await message.channel.send({embed : embed.meme(image, pinku, message)});
  }
}
