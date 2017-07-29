const Command = require('../../cogs/commands/framework');
const Discord = require('discord.js');

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
  {	let bguilds = this.client.guilds.filter(g=>g.members.filter(m=>!m.user.bot).size < g.members.filter(m=>m.user.bot).size).size;

    let eguilds = this.client.guilds.filter(g=>g.members.filter(m=>!m.user.bot).size === g.members.filter(m=>m.user.bot).size).size;

    let uguilds = this.client.guilds.filter(g=>g.members.filter(m=>!m.user.bot).size > g.members.filter(m=>m.user.bot).size).size;

    const embed = new Discord.RichEmbed()
    .setAuthor(`${this.client.user.username} current Guild Rates`, this.client.user.displayAvatarURL)
    .setDescription('\u200b')
    .addField('Humans > Bots', uguilds, true)
    .addField('Bots > Humans', bguilds, true)
    .addField('Humans === Bots', eguilds, true)
    .addField('Total Guilds', this.client.guilds.size, true)
    .setThumbnail(this.client.user.displayAvatarURL)
    .setColor(color)
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL);

    await message.channel.send({embed});	}	}
