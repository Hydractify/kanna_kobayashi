const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class EndMe extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['plsendmylifeijustwanttostopfeelingthepainthatisbeinglonely'],
      name: 'endme',
      category: 'gen1',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let img = require('../util/links').memes.endme;

    await message.channel.send({embed : embed.meme(img, color, message)});
  }
}
