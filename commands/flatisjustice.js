const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class FlatIsJustice extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['flat'],
      name: 'flatisjustice',
      category: 'gen3',
      enabled: true
    })
  }

  async run(client, message, color)
  {
    let img = require('../util/links').memes.flatisjustice;

    await message.channel.send({embed : embed.meme(img, color, message)});
  }
}
