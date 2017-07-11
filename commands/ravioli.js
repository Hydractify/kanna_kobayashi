const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Ravioli extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['praise'],
      category: 'gen4',
      name: 'ravioli',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let image = require('../util/links').memes.ravioli;

    await message.channel.send('<:oh:315264555859181568> | **Ravioli Ravioli all praise the Dragon Loli**', {embed : embed.meme(image, color, message)});
  }
}
