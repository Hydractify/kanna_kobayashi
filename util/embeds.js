const Discord = require('discord.js');
const wolke = require('./wolkeapi');

module.exports = class Embed {
  static meme(link, color, message) {

    if (typeof link !== 'string') throw new Error('Link must be a String!');
    if (typeof color !== 'string') throw new Error('Color must be a String!');
    if (typeof message !== 'object') throw new Error('Message must be an object!');

    return new Discord.RichEmbed()
    .setColor(color)
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
    .setImage(link);
  }

  static async wolke(type, color, message)
  {
    if (typeof color !== 'string') throw new Error('Color must be a String!');

    let image = await wolke.picture(type);

    return new Discord.RichEmbed()
    .setColor(color)
    .setFooter(`Requested by ${message.author.tag} | Provided by Wolke#6746`, message.author.displayAvatarURL)
    .setImage('https://rra.ram.moe' + image.body.path);
  }

  static common(color, message)
  {
    if (typeof color !== 'string') throw new Error('Color must be a String!');
    if (typeof message !== 'object') throw new Error('Message must be an object!');

    return new Discord.RichEmbed()
    .setColor(color)
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL);
  }
}
