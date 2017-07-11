const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Ten extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['10'],
      category: 'gen2',
      name: '10',
      enabled: true
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.ten;

    await message.channel.send({embed : embed.meme(image, pinku, message)});
  }
}
