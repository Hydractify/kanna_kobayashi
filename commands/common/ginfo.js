const Command = require('../../cogs/commands/framework');
const Discord = require('discord.js');
const fetchMs = require('../../util/fetch/members');

module.exports = class GuildInfo extends Command {
  constructor() {
    super({
      alias: ['gstats', 'gg'],
      coins: 0,
      exp: 0,
      name: 'ginfo',
      description: 'Look a guild info! It\'s ID, who owns it... and more!',
      enabled: true
    });
  }

  async run(message, color) {
    let guild = await fetchMs(message);

    let members = guild.members;

    let roleNames = guild.roles.map(r => r.toString()).join(' ');
    if (roleNames.length > 2048) roleNames = roleNames.split(' ').slice(0, 20).join(' ') + '...';

    let emojiNames = guild.emojis.map(e => e.toString()).join(' ');
    if (emojiNames.length > 2048) emojiNames = emojiNames.split(' ').slice(0, 20).join(' ') + '...';

    const embed = new Discord.RichEmbed()
    .setColor(color)
    .setThumbnail(guild.iconURL)
    .setAuthor(`${guild.name} Stats`, guild.iconURL)
    .setDescription('\u200b')
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
    .addField('Guild ID', guild.id, true)
    .addField('Server Region', guild.region, true)
    .addField('Guild Creation', require('moment')(guild.createdTimestamp).format('MM/DD/YYYY (HH:mm)'), true)
    .addField('Owner', guild.owner.toString(), true)
    .addField('Owner ID', guild.owner.user.id, true)
    .addField('Total Members', guild.memberCount, true)
    .addField('Humans', members.filter(u => !u.user.bot).size, true)
    .addField('Bots', members.filter(u => u.user.bot).size, true)
    .addField('Total Channels', guild.channels.size, true)
    .addField('Text Channels', guild.channels.filter(c => c.type === "text").size, true)
    .addField('Voice Channels', guild.channels.filter(c => c.type === "voice").size, true)
    .addField('Total Roles', guild.roles.size, true)
    .addField('Role Names', roleNames)
    .addField('Total Emojis', guild.emojis.size)
    .addField('Emoji Names', emojiNames);

    await message.channel.send({embed});
  }
}
