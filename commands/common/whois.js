const Command = require('../../cogs/commands/framework');
const common = require('../../util/embeds/common');
const fetchUser = require('../../util/fetch/user');
const fetchMember = require('../../util/fetch/member');
const moment = require('moment');

module.exports = class WhoIs extends Command {
  constructor() {
    super({
      alias: ['ust', 'whois'],
      example: ['whois', 'whois @Wizardλ#5679'],
      name: 'whois',
      enabled: true
    });
  }

  async run(message, color, args) {
    if (args[0]) {
      let user = await fetchUser(message, args);
      if (!user) return;
      let member = await fetchMember(message, args);
      if (!member) return;

      const embed = common(color, message)
      .setThumbnail(user.displayAvatarURL)
      .setAuthor(`${member.displayName} Information`, user.displayAvatarURL)
      .setDescription('\u200b')
      .addField('ID', user.id, true)
      .addField('Username', user.username, true)
      .addField('Nickname', member.nickname || 'None', true)
      .addField('Discriminator', user.discriminator, true)
      .addField('Status', user.presence.status, true)
      .addField('Playing', user.presence.game ? user.presence.game.name : 'Nothing', true)
      .addField('Shared Guilds on this Shard', this.client.guilds.filter(g=>g.members.find(m=>m.user.id === user.id)).size, true)
      .addField('Date of Creation', moment(user.createdTimestamp).format('MM/DD/YYYY (HH:mm)') + ' [' + moment.duration(user.createdTimestamp - message.createdTimestamp).humanize() + ']', true)
      .addField('Join Date', moment(member.joinedTimestamp).format('MM//DD/YYYY (HH:mm)') + ' [' + moment.duration(member.joinedTimestamp - message.createdTimestamp).humanize() + ']', true)
      .addField('Roles', member.roles.map(r => r.toString()).join(', ') || 'None', true)
      .addField('Avatar', `[Link to it](${user.displayAvatarURL})`)
      .setImage(user.displayAvatarURL);

      await message.channel.send({embed});
    } else {
      let user = message.author;
      let member = message.member;

      const embed = common(color, message)
      .setThumbnail(user.displayAvatarURL)
      .setAuthor(`${member.displayName} Information`, user.displayAvatarURL)
      .setDescription('\u200b')
      .addField('ID', user.id, true)
      .addField('Username', user.username, true)
      .addField('Nickname', member.nickname || 'None', true)
      .addField('Discriminator', user.discriminator, true)
      .addField('Status', user.presence.status, true)
      .addField('Playing', user.presence.game ? user.presence.game.name : 'Nothing', true)
      .addField('Shared Guilds on this Shard', this.client.guilds.filter(g=>g.members.find(m=>m.user.id === user.id)).size, true)
      .addField('Date of Creation', moment(user.createdTimestamp).format('MM/DD/YYYY (HH:mm)') + ' [' + moment.duration(user.createdTimestamp - message.createdTimestamp).humanize() + ']', true)
      .addField('Join Date', moment(member.joinedTimestamp).format('MM//DD/YYYY (HH:mm)') + ' [' + moment.duration(member.joinedTimestamp - message.createdTimestamp).humanize() + ']', true)
      .addField('Roles', member.roles.map(r => r.toString()).join(', ') || 'None', true)
      .addField('Avatar', `[Link to it](${user.displayAvatarURL})`)
      .setImage(user.displayAvatarURL);

      await message.channel.send({embed});
    }
  }
}
