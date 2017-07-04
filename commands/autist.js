const Discord = require('discord.js');
const Command = require('../engine/commandClass');

module.exports = class Autist extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['autistic'],
      category: 'gen2',
      name: 'autist'
    });
  }

  async run(client, message, color)
  {
    const autist = require('../util/links').memes.autist;
    let img = autist[Math.floor(Math.random() * autist.length)];

    const embed = new Discord.RichEmbed()
    .setImage(img)
    .setColor(color);

    await message.channel.send({embed});
  }
}
