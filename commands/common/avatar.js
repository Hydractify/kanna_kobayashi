const Discord = require('discord.js');
const Command = require('../../cogs/commands/framework');
const userFetch = require('../../util/fetch/user');

module.exports = class Avatar extends Command {
  constructor() {
    super({
      name: 'avatar',
      alias: ['av'],
      example: ['avatar @Kanna Kobayashi#5685'],
      exp: 0,
      coins: 0,
      enabled: true
    });
  }

  async run(message, color, args) {
    let user = message.author;
    if (args[0] || message.mentions.size >= 1) {
      user = await userFetch(message, args);
    }
    const embed = new Discord.RichEmbed()
    .setImage(user.displayAvatarURL)
    .setColor(color)
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
    .setAuthor(`${user.tag} Avatar`, user.displayAvatarURL)
    .setURL(user.displayAvatarURL);
    await message.channel.send({embed});
  }
}
