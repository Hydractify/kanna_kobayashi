const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Autist extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['autistic'],
      category: 'gen2',
      name: 'autist',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let autist = require('../util/links').memes.autist;
    let img = autist[Math.floor(Math.random() * autist.length)];

    await message.channel.send({embed : embed.meme(img, color, message)});
  }
}
