const Discord = require('discord.js');
const Command = require('../engine/commandClass');
const moment = require('moment');

module.exports = class StAtUs extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['kannastats', 'bstats'],
      coins: 0,
      exp: 0,
      name: 'stats',
    });
  }

  async run(client, message, color)
  {

    const users =
    {
      humans: 0
    };

    for (const user of client.users.values())
    {
      if (!user.bot)++users.humans;
    };

    let uptime = moment.duration(client.uptime).humanize();

    const embed = new Discord.RichEmbed()
    .setAuthor(`${client.user.username} Stats`, client.user.displayAvatarURL)
    .setDescription('\u200b')
    .setColor(color)
    .setThumbnail(client.user.displayAvatarURL)
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
    .addField('Uptime <:hugme:299650645001240578>', uptime, true)
    .addField('Guilds <:oh:315264555859181568>', client.guilds.size, true)
    .addField('Humans <:police:331923995278442497>', users.humans, true)
    .addField('Current Build Version <:isee:315264557843218432>', require('../package').version, true);

    await message.channel.send({embed});
  }
}
