const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class ForEver extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['blueeyedragon'],
      category: 'gen4',
      name: 'duel',
      enabled: true
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.duel;

    await message.channel.send({embed : embed.meme(image, pinku, message)});
  }
}
