const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class ForEver extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['bosssleeppls'],
      category: 'gen4',
      name: 'sleep',
      enabled: true
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.sleep;

    await message.channel.send({embed : embed.meme(image, pinku, message)});
  }
}
