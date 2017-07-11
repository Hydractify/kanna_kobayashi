const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Cancer extends Command
{
  constructor(client)
  {
    super(client,
    {
      name: 'cancer',
      category: 'gen3',
      alias: ['whykannahavesacancercommand'],
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let img = require('../util/links').memes.cancer;

    await message.channel.send({embed : embed.meme(img, color, message)});
  }
}
