const Discord = require('discord.js');
module.exports = (color, message) =>
{ if (typeof color !== 'string') throw new Error('Color must be a String!');
  if (typeof message !== 'object') throw new Error('Message must be an object!');

  return new Discord.RichEmbed()
  .setColor(color)
  .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL);	}