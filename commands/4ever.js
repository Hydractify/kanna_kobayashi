const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class ForEver extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['forever'],
      category: 'gen3',
      name: '4ever',
      enabled: true
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.forever;

    await message.channel.send({embed : embed.meme(image, pinku, message)});
  }
}
