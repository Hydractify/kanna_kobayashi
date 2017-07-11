const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Police extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['policepls'],
      category: 'gen2',
      name: 'police',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let image = require('../util/links').memes.police;

    await message.channel.send('<:police:331923995278442497>', {embed : embed.meme(image, color, message)});
  }
}
