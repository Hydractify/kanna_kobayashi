const Discord = require('discord.js');
const Command = require('../engine/commandClass');

module.exports = class ForEver extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['forever'],
      category: 'gen3',
      name: '4ever'
    });
  }

  async run(client, message, pinku)
  {
    let image = require('../util/links.json').memes.forever;
    const embed = new Discord.RichEmbed()
    .setImage(image)
    .setColor(pinku);

    await message.channel.send({embed});
  }
}
