const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Hungry extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['itadakimasu'],
      name: 'hungry',
      category: 'gen1'
    });
  }

  async run(client, message, color)
  {
    let i = require('../util/links').memes.hungry;
    let image = i[Math.floor(Math.random() * i.length)];

    await message.channel.send({embed : embed.meme(image, color, message)});
  }
}
