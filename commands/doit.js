const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class DoIt extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['worship'],
      name: 'doit',
      category: 'gen2'
    });
  }

  async run(client, message, color)
  {
    let img = require('../util/links').memes.doit;

    await message.channel.send(`<:omfg:315264558279426048> | **Do it ${message.author}**`, {embed: embed.meme(img, color, message)});
  }
}
