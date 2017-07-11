const Command = require('../engine/commandClass');
const embed = require('../util/embeds');

module.exports = class Drunk extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['sake'],
      name: 'drunk',
      category: 'gen1',
      enabled: true
    })
  }

  async run(client, message, color)
  {
    let image = require('../util/links').memes.drunk;

    await message.channel.send('You have to be this cute to be drunk  <:lewd:320406420824653825>', {embed : embed.meme(image, color, message)});
  }
}
