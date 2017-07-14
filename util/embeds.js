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

  static async ibsearch(client, color, message, args)
  {
    let image = await apis.ibsearch('random:');

    if(args[0])
    {
      if(args.length > 1)
      {
        image = await apis.ibsearch(args[0]);
      }
      else
      {
        image = await apis.ibsearch(args.join('+'));
      }
    }

    image = image.body[Math.floor(Math.random() * image.body.length)];

    let rating = image.rating;

    if(rating === 's')
    {
      rating = 'Safe';
    }
    else if(rating === 'q')
    {
      rating = 'Questionable';
    }
    else if(rating === 'e')
    {
      rating = 'Explicit';
    }
    else
    {
      rating = 'Unknown';
    }

    return new Discord.RichEmbed()
    .setColor(color)
    .setFooter(`Requested by ${message.author.tag} | Powered by ibsear.ch`, message.author.displayAvatarURL)
    .setImage(`https://${image.server}.ibsear.ch/${image.path}`, client.user.displayAvatarURL)
    .setAuthor(`IbSearch SFW Result (${rating})`, client.user.displayAvatarURL)
    .setDescription(image.tags.split(' ').slice(0, 10).join(', ') + '...');
  }

  static async ibsearch_xxx(client, color, message, args)
  {
      let image = await apis.ibsearch_xxx('random:');

      if(args[0])
      {
        if(args.length > 1)
        {
          image = await apis.ibsearch_xxx(args[0]);
        }
        else
        {
          image = await apis.ibsearch_xxx(args.join('+'));
        }
      }

      image = image.body[Math.floor(Math.random() * image.body.length)];

      let rating = image.rating;

      if(rating === 's')
      {
        rating = 'Safe';
      }
      else if(rating === 'q')
      {
        rating = 'Questionable';
      }
      else if(rating === 'e')
      {
        rating = 'Explicit';
      }
      else
      {
        rating = 'Unknown';
      }

      return new Discord.RichEmbed()
      .setColor(color)
      .setFooter(`Requested by ${message.author.tag} | Powered by ibsearch.xxx`, message.author.displayAvatarURL)
      .setImage(`https://${image.server}.ibsearch.xxx/${image.path}`)
      .setAuthor(`IbSearch NSFW Result (${rating})`, client.user.displayAvatarURL)
      .setDescription(image.tags.split(' ').slice(0, 10).join(', ') + '...');
    }
}
