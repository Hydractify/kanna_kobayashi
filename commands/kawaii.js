const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Kawaii extends Command
{
  constructor(client)
  {
    super(client,
      {
        alias: ['cute'],
        name: 'kawaii',
        category: 'int'
      });
  }

  async run(client, message, color)
  {
    let i = require('../util/links');
    let image = i[Math.floor(Math.random() * i.length)];

    await message.channel.send({embed : embed.meme(image, color, message)});
  }
}
