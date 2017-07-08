const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Listen extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['heylisten'],
      category: 'gen2',
      name: 'listen'
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.listen;

    await message.channel.send({embed : embed.meme(image, pinku, message)});
  }
}
