const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Loli extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['callpoliceplscuziamalolicon'],
      category: 'gen1',
      name: 'loli'
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.loli;
    image = image[Math.floor(Math.random() * image.length)];

    await message.channel.send('<:woa:315264558413381646>  Hmm... A hooman', {embed : embed.meme(image, pinku, message)});
  }
}
