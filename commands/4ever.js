const Discord = require('discord.js');
const Command = require('../engine/commandClass.js');

module.exports = class ForEver extends Command {
  constructor(client) {
    super(client, {
      alias: ['forever'],
      name: '4ever',
      usage: '4ever',
      category: 'gen3'
    })
  }

  async run(client, message, pinku) {
    const mforever = new Discord.RichEmbed();
    mforever.setImage('https://cdn.discordapp.com/attachments/299632702087495680/303298736765796372/FOREVER.png');
    mforever.setColor(pink);

    await message.channel.send({embed : mforever});
  }
}
