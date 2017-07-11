const Command = require('../engine/commandClass');
const embeds = require('../util/embeds');
const get = require('../util/get');
const moment = require('moment');

module.exports = class WhoIs extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['ust', 'whois'],
      example: ['whois', 'whois @Wizardλ#5679'],
      name: 'whois',
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    if(args[0])
    {
      const user = await get.user(client, message, args);
      if(!user) return;
      const member = await get.memberu(client, message, args);
      if(!member) return;

      const embed = embeds.common(color, message)
      .setThumbnail(user.displayAvatarURL)
      .setAuthor(`${member.displayName} Information`, user.displayAvatarURL)
      .setDescription('\u200b')
      .addField('ID', user.id, true)
      .addField('Username', user.username, true)
      .addField('Nickname', member.nickname || 'None', true)
      .addField('Discriminator', user.discriminator, true)
      .addField('Status', user.presence.status, true)
      .addField('Playing', user.presence.game ? user.presence.game.name : 'Nothing', true)
      .addField('Total Shared Guilds', client.guilds.filter(g=>g.members.find(m=>m.user.id === message.author.id)).size, true)
      .addField('Date of Creation', moment(user.createdTimestamp).format('MM/DD/YYYY (HH:mm)') + ' [' + moment.duration(user.createdTimestamp).humanize() + ']', true)
      // Need be fixed /\
      .addField('Join Date', moment(member.joinedTimestamp).format('MM//DD/YYYY (HH:mm)') + ' [' + moment.duration(member.joinedTimestamp).humanize() + ']', true)
      // Need be fixed aswell /\
      .addField('Roles', member.roles.map(r => r.toString()).join(', ') || 'None', true)
      .addField('Avatar', `[Link to it](${user.displayAvatarURL})`)
      .setImage(user.displayAvatarURL);

      await message.channel.send({embed});
    }
    else
    {

    }
  }
}
