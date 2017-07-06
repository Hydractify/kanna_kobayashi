const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Friends extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['tomodachi'],
      name: 'friends',
      category: 'gen2'
    });
  }

  async run(client, message, color)
  {
    let img = require('../util/links').memes.friends;

    await message.channel.send({embed : embed.meme(img, color, message)});
  }
}
