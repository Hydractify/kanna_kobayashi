const Command = require('../engine/commandClass');
const Discord = require('discord.js');

module.exports = class GuildInfo extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['gstats', 'gg'],
      coins: 0,
      exp: 0,
      name: 'ginfo',
      description: 'Look a guild info! It\'s ID, who owns it... and more!'
    });
  }

  async run(client, message, color)
  {
    let guildo = await require('../util/get').members(message);

    let members = guildo.members;

    let roleNames = message.guild.roles.map(r => r.toString()).join(', ');

    if(message.guild.roles.map(r => r.toString()).join(', ').length > 1024) roleNames = `Too many characters! (${message.guild.roles.map(r => r.toString()).join(', ').length})`;

    const embed = new Discord.RichEmbed()
    .setColor(color)
    .setThumbnail(message.guild.iconURL)
    .setAuthor(`${message.guild.name} Stats`, message.guild.iconURL)
    .setDescription('\u200b')
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
    .addField('Guild ID', message.guild.id, true)
    .addField('Server Region', message.guild.region, true)
    .addField('Guild Creation', require('moment')(message.guild.createdTimestamp).format('MM/DD/YYYY (HH:mm)'), true)
    .addField('Owner', message.guild.owner.toString(), true)
    .addField('Owner ID', message.guild.owner.user.id, true)
    .addField('Total Members', message.guild.memberCount, true)
    .addField('Humans', members.filter(u => !u.user.bot).size, true)
    .addField('Bots', members.filter(u => u.user.bot).size, true)
    .addField('Total Channels', message.guild.channels.size, true)
    .addField('Text Channels', message.guild.channels.filter(c => c.type === "text").size, true)
    .addField('Voice Channels', message.guild.channels.filter(c => c.type === "voice").size, true)
    .addField('Total Roles', message.guild.roles.size, true)
    .addField('Role Names', roleNames);

    await message.channel.send({embed});
  }
}
