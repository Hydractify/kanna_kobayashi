const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class BrAiNe extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['braine'],
      name: 'brain',
      category: 'gen3',
      enabled: true
    });
  }

  async run(client, message, color)
  {

    let img = require('../util/links').memes.brain;

    await message.channel.send({embed : embed.meme(img, color, message)});
  }
}
