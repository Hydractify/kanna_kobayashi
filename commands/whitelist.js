const Discord = require('discord.js');
const Command = require('../engine/commandClass');
const fs = require('fs');
const log = require('../util/log');

module.exports = class Blacklist extends Command
{
  constructor(client)
  {
    super(client,
    {
      name: 'whitelist',
      permLevel: 3,
      alias: ['reverse-exile'],
      category: 'unique',
      usage: 'whitelist <key> <value>',
      example: ['whitelist id 279018121099214848', 'whitelist name TESTING'],
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    let bk = JSON.parse(fs.readFileSync('./util/whitelist.json', 'utf8'));

    if(args[0] === 'id')
    {

      if(!args[1]) return message.channel.send(`${message.author} you must provide an ID!\n\n**Example**: \`${this.example[0]}\``);

      if(!client.guilds.get(args[1])) return message.channel.send(`Couldn't find **${args[1]}**!`)

      await message.channel.send(`The guild name is **${client.guilds.get(args[1]).name}** and the owner is **${client.guilds.get(args[1]).owner.user.tag}** is it right?`);

      var collected = await message.channel.awaitMessages(response => response.author === message.author && (response.content.toLowerCase() === 'yes' || response.content.toLowerCase() === 'no'), { max: 1 });

      if(collected.first().content.toLowerCase() === 'yes')
      {
        await bk.push(args[1]);
        await fs.writeFile('./util/whitelist.json', JSON.stringify(bk), 'utf8', (err) =>
      {
        if(err) log.error(err);
      });
      await message.channel.send(`**${client.guilds.get(args[1]).name}** is getting whitelisted!`);

      const embed = new Discord.RichEmbed()
      .setColor(color)
      .setTimestamp()
      .setAuthor(`Whitelisted by ${message.author.tag}`, message.author.displayAvatarURL)
      .addField('ID', args[1], true)
      .addField('Name', client.guilds.get(args[1]).name, true)
      .setDescription('\u200b')
      .setThumbnail(client.guilds.get(args[1]).iconURL);

      await client.guilds.get('298969150133370880').channels.get('302286657271496705').send({embed});
      };

      if(collected.first().content.toLowerCase() === 'no') {
        await message.channel.send('Ok, cancelling whitelist.');
      };

    }
    else if(args[0] === 'name')
    {
      if(!args[1]) return message.channel.send(`${message.author} you must provide a name!\n\n**Example:** \`${this.example[1]}\``);

      if(!client.guilds.find('name', args[1])) return message.channel.send(`Couldn't find **${args[1]}**!`)

      await message.channel.send(`The guild name is **${client.guilds.find('name', args[1]).name}** and the owner is **${client.guilds.find('name', args[1]).owner.user.tag}** is it right?`);

      var collected = await message.channel.awaitMessages(response => response.author === message.author && (response.content.toLowerCase() === 'yes' || response.content.toLowerCase() === 'no'), { max: 1 });

          if(collected.first().content.toLowerCase() === 'yes')
          {
            await bk.push(client.guilds.find('name', args[1]).id);
            await fs.writeFile('./util/whitelist.json', JSON.stringify(bk), 'utf8', (err) =>
          {
            if(err) log.error(err);
          });
          await message.channel.send(`**${args[1]}** is getting whitelist!`);

          const embed = new Discord.RichEmbed()
          .setColor(color)
          .setTimestamp()
          .setAuthor(`whitelist by ${message.author.tag}`, message.author.displayAvatarURL)
          .addField('ID', client.guilds.find('name', args[1]).id, true)
          .addField('Name', (args[1]), true)
          .setDescription('\u200b')
          .setThumbnail(client.guilds.find('name', args[1]).iconURL);

          await client.guilds.get('298969150133370880').channels.get('302286657271496705').send({embed});
          }
          if(collected.first().content.toLowerCase() === 'no')
          {
            await message.channel.send('Ok, cancelling blacklist.');
          }
    }
    else if(!args[0] || args[1] !== 'id' && args[1] !== 'name')
    {
      await message.channel.send(`Hey ${message.author}! That's not how you use it!\n\n**Usage**: \`${this.usage}\``);
    }
    else
    {
      await message.channel.send('Something went wrong!');
    }
  }
}
