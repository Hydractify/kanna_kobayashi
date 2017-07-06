const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Dance extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['flop'],
      name: 'dance',
      category: 'gen2'
    });
  }

  async run(client, message, color)
  {
    let img = require('../util/links').memes.dance[Math.floor(Math.random() * require('../util/links').memes.dance.length)];

    await message.channel.send({embed : embed.meme(img, color, message)});
  }
}
