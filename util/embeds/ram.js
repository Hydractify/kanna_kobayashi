const Discord = require('discord.js');
const ram = require('../../cogs/connections/apis/ram');

module.exports = async (type, color, message) =>
{ if (typeof color !== 'string') throw new Error('Color must be a String!');

  let image = await ram(type);


  return new Discord.RichEmbed()
  .setColor(color)
  .setFooter(`Requested by ${message.author.tag} | Powered by ram.moe`, message.author.displayAvatarURL)
  .setImage('https://rra.ram.moe' + image.body.path); }