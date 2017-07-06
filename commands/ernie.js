const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Ernie extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['puppet'],
      category: 'gen3',
      name: 'ernie'
    })
  }

  async run(client, message, color)
  {
    let img = require('../util/links').memes.ernie;

    await message.channel.send({embed : embed.meme(img, color, message)});
  }
}
