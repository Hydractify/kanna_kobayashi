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

    let roleNames = [];
    for (const role of guild.roles.values()) {
        if (roleNames.join(' ').length + role.toString().length > 1021) {
          roleNames.push('...');
          break;
        }
        roleNames.push(role.toString());
    }

    let emojiNames  = [];
    for (const emoji of guild.emojis.values()) {
        if (emojiNames.join(' ').length + emoji.toString().length > 1021) {
          emojiNames.push('...');
          break;
        }
        emojiNames.push(emoji.toString());
    }

    const embed = new Discord.RichEmbed()
    .setColor(color)
    .setThumbnail(guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png')
    .setAuthor(`${guild.name} Stats`, guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png')
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
    .addField('Total Roles', guild.roles.size)
    .addField('Role Names', roleNames.join(' '))
    .addField('Total Emojis', guild.emojis.size)
    .addField('Emoji Names', emojiNames.join(' ') || 'None');

    await message.channel.send({embed});
  }
}
