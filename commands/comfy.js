const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Comfy extends Command
{
  constructor(client)
  {
    super(client,
    {
      name: 'comfy',
      alias: ['comfu']
    });
  }

  async run(client, message, color)
  {
    let img = require('../util/links').memes.comfy;

    var image = img[Math.floor(Math.random() * img.length)];

    await message.channel.send({embed: embed.meme(image, color, message)});
  }
}
