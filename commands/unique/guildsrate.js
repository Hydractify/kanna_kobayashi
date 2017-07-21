const Command = require('../../cogs/commands/framework');
const Discord = require('discord.js');
const { client } = require('../../cogs/connections/discord');

module.exports = class GuildsRate extends Command
{ constructor()
  { super(
    { alias: ['grates'],
      permLevel: 3,
      name: 'guildsrate',
      coins: 0,
      exp: 0,
      enabled: true	});	}

  async run(message, color)
  {	let bguilds = client.guilds.filter(g=>g.members.filter(m=>!m.user.bot).size < g.members.filter(m=>m.user.bot).size).size;

    let eguilds = client.guilds.filter(g=>g.members.filter(m=>!m.user.bot).size === g.members.filter(m=>m.user.bot).size).size;

    let uguilds = client.guilds.filter(g=>g.members.filter(m=>!m.user.bot).size > g.members.filter(m=>m.user.bot).size).size;

    const embed = new Discord.RichEmbed()
    .setAuthor(`${client.user.username} current Guild Rates`, client.user.displayAvatarURL)
    .setDescription('\u200b')
    .addField('Humans > Bots', uguilds, true)
    .addField('Bots > Humans', bguilds, true)
    .addField('Humans === Bots', eguilds, true)
    .addField('Total Guilds', client.guilds.size, true)
    .setThumbnail(client.user.displayAvatarURL)
    .setColor(color)
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL);

    await message.channel.send({embed});	}	}
