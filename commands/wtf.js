const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class ForEver extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['dafuk'],
      category: 'gen3',
      name: 'wtf',
      enabled: true
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.wtf;

    await message.channel.send({embed : embed.meme(image, pinku, message)});
  }
}
