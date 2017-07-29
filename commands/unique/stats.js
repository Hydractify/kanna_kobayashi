const Discord = require('discord.js');
const Command = require('../../cogs/commands/framework');
const moment = require('moment');

module.exports = class StAtUs extends Command
{ constructor()
  { super(
    {
      alias: ['kannastats', 'bstats'],
      coins: 0,
      exp: 0,
      name: 'stats',
      enabled: true	});	}

  async run(message, color)
  {	const guildValues = await this.client.shard.fetchClientValues('guilds.size');
    const userValues = await this.client.shard.fetchClientValues('users.size');

    const totalGuilds = guildValues.reduce((prev, val) => prev + val, 0);
    const totalUsers = userValues.reduce((prev, val) => prev + val, 0);


    let uptime = `${moment.duration(this.client.uptime).days()}:${moment.duration(this.client.uptime).hours()}:${moment.duration(this.client.uptime).minutes()}:${moment.duration(this.client.uptime).seconds()}`

    const embed = new Discord.RichEmbed()
    .setAuthor(`${this.client.user.username} Stats`, this.client.user.displayAvatarURL)
    .setDescription('\u200b')
    .setColor(color)
    .setThumbnail(this.client.user.displayAvatarURL)
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
    .addField('Uptime <:hugme:299650645001240578>', uptime + ` [${moment.duration(this.client.uptime).humanize()}]`, true)
    .addField('Guilds <:oh:315264555859181568>', totalGuilds, true)
    .addField('Humans <:police:331923995278442497>', totalUsers, true)
    .addField('Current Build Version <:isee:315264557843218432>', require('../../package').version, true)
    .addField('RAM Used <:tired:315264554600890390>', Math.floor((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)) + 'MB', true)
    .addField('Shards <:hmm:315264556282675200>', this.client.shard.count, true);

    await message.channel.send({embed});	}	}
