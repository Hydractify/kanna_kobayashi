const Discord = require('discord.js');
const api = require('../../cogs/connections/apis/cat');

module.exports = async (color, message) =>
{ let image = await api();

  return new Discord.RichEmbed()
  .setColor(color)
  .setFooter(`Requested by ${message.author.tag} | Powered by random.cat`, message.author.displayAvatarURL)
  .setImage(image.body.file);	}
