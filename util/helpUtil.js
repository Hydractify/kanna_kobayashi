const Discord = require('discord.js');

module.exports = class HelpUtil
{
  constructor(client, message, args, color)
  {
    if(!Array.isArray(args)) throw new Error('Args must be an array!');
    if(typeof client !== 'object') throw new Error('Client must be an object!');
    if(typeof color !== 'string') throw new Error('Color must be a String!');
    this.message = message;
    this.client = client;
    this.args = args;
    this.color = color;
  }

  categoryMap(category, name)
  {
    if(typeof category !== 'string' || typeof name !== 'string') throw new Error('Category and Name must be a String!');

    const embed = new Discord.RichEmbed()
    .setFooter(`Requested by ${this.message.author.tag}`, this.message.author.displayAvatarURL)
    .setThumbnail(this.client.user.displayAvatarURL)
    .setURL('http://kannathebot.me/guild')
    .setAuthor(`${this.client.user.username} ${name} Commands`, this.client.user.displayAvatarURL)
    .setTimestamp()
    .setDescription('\u200b')
    .setColor(this.color)

    this.client.commands.filter(c=>c.category === category).forEach(c => embed.addField('kanna pls ' + c.name, c.description));

    return embed;
  }

  findCmd(color)
  {
    if(this.client.commands.has(this.args[0]))
    {
      let command = this.client.commands.get(this.args[0]);

      let example = Array.isArray(command.example) ? 'kanna pls' + command.example.join('\nkanna pls ') : command.example;

      const embed = new Discord.RichEmbed()
      .setAuthor(`${this.args[0].toUpperCase()} Info`, this.client.user.displayAvatarURL)
      .setDescription('\u200b')
      .setFooter(`Requested by ${this.message.author.tag}`, this.message.author.displayAvatarURL)
      .setURL('http://kannathebot.me/guild')
      .setThumbnail(this.client.user.displayAvatarURL)
      .setTimestamp()
      .addField('Usage', 'kanna pls ' + command.usage, true)
      .addField('Example', example, true)
      .addField('Aliases', 'kanna pls ' + command.alias.join('\nkanna pls '), true)
      .addField('Description', command.description, true)
      .addField('Permission Level', command.permLevel, true)
      .addField('Enabled', command.enabled ? 'Yes':'No', true)
      .setColor(color);

      return this.message.channel.send({embed})
    }
    else
    {
      return this.message.channel.send(`Couldn't find any command with the name **${this.args[0]}**`);
    }
  }
}
