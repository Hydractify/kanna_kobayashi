const Command = require('../engine/commandClass');
const embed = require('../util/embeds');
const image = require('../util/links.json')

module.exports = class BOOBS extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['bubs', 'b00bs'],
      name: 'boobs',
      category: 'gen4'
    })
  }

  async run(client, message, color)
  {

    let arr = image.memes.boobs;
    let img = arr[Math.floor(Math.random() * arr.length)];

    await message.channel.send({embed : embed.meme(img, color, message)});

  }
}
