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
      enabled: true
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

    let uptime = `${moment.duration(client.uptime).days()}:${moment.duration(client.uptime).hours()}:${moment.duration(client.uptime).minutes()}:${moment.duration(client.uptime).seconds()}`

    const embed = new Discord.RichEmbed()
    .setAuthor(`${client.user.username} Stats`, client.user.displayAvatarURL)
    .setDescription('\u200b')
    .setColor(color)
    .setThumbnail(client.user.displayAvatarURL)
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
    .addField('Uptime <:hugme:299650645001240578>', uptime + ` [${moment.duration(client.uptime).humanize()}]`, true)
    .addField('Guilds <:oh:315264555859181568>', client.guilds.size, true)
    .addField('Humans <:police:331923995278442497>', users.humans, true)
    .addField('Current Build Version <:isee:315264557843218432>', require('../package').version, true)
    .addField('RAM Used <:tired:315264554600890390>', Math.floor((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)) + 'MB', true)
    .addField('Shards <:hmm:315264556282675200>', client.shard.count, true);

    await message.channel.send({embed});
  }
}
