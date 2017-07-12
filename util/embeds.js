const Discord = require('discord.js');
const apis = require('./apis');

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

    let image = await apis.wolke(type);


    return new Discord.RichEmbed()
    .setColor(color)
    .setFooter(`Requested by ${message.author.tag} | Powered by ram.moe`, message.author.displayAvatarURL)
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

  static async cat(color, message)
  {
    let image = await apis.meow();

    return new Discord.RichEmbed()
    .setColor(color)
    .setFooter(`Requested by ${message.author.tag} | Powered by random.cat`, message.author.displayAvatarURL)
    .setImage(image.body.file);
  }
}
