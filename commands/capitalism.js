const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Capit extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['capit'],
      name: 'capitalism',
      category: 'gen3',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let img = require('../util/links').memes.capitalism;

    await message.channel.send({embed:embed.meme(img, color, message)});
  }
}
