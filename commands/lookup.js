const Command = require('../engine/commandClass');
const get = require('../util/get');
const embeds = require('../util/embeds');
const moment = require('moment');

module.exports = class Lookup extends Command
{
  constructor(client)
  {
    super(client,
    {
      name: 'lookup',
      alias: ['checkinvite'],
      coins: 0,
      exp: 0,
      cooldown: 10000,
      category: 'unique',
      usage: 'lookup <link>',
      example: ['lookup uBdXdE9'],
      enabled: false
    })
  }

  async run(client, message, color, args)
  {
    if(!args[0]) message.channel.send(`${message.author} you must put a link!\n\nUsage: \`${this.usage}\``);

    const invite = await get.invite(client, args[0], message);
    if(!invite) return;

    console.log(invite);

    const embed = embeds.common(color, message)
    .setThumbnail(invite.guild.iconURL)
    .setAuthor(`Invite to ${invite.guild.name}`, invite.guild.iconURL)
    .setDescription('\u200b')
    .setURL(invite.url)
    .addField('Total Members', invite.guild.memberCount, true)
    .addField('Guild Creation', moment(invite.guild.createdTimestamp).format('MM/DD/YYYY') + ` (${moment.duration(invite.guild.createdTimestamp - message.createdTimestamp).humanize()} from now)`, true)

    await message.channel.send({embed});
  }
}
