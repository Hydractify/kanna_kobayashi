const Discord = require('discord.js');
const Command = require('../engine/commandClass.js');
const r = require('rethinkdb');
const Database = require('../engine/Database');
const table = require('../engine/db/tables');
const get = require('../util/get');

module.exports = class Profile extends Command {
  constructor(client)
  {
    super(client,
      {
        alias: ['pf'],
        name: 'profile',
        usage: 'profile <user>',
        category: '',
        description: 'Look your own profile or of your friends!',
        permLevel: 2
      })
  }

  async run(client, message, pinku, args)
  {
    let user = message.author
    if(args[0] || message.mentions.size >= 1)
    {
      let fetch = await get.user(client, message, args);
      if(fetch !== undefined)
      {
        user = fetch;
      }
    }
    if(user.bot) return message.channel.send(`Bots don't have profiles!`);

    const member = await message.guild.fetchMember(user);
    const result = await table.stats(Database.connection, 'stats', user.id);
    const uInfo = table.userStat(result);

    if(!result.length)
    {
      await table.insert(Database.connection, 'stats',
    {
      id: user.id,
      level: 1,
      exp: 0,
      coins: 100,
      items: [],
      badges: [],
      baseExp: 100
    });

    const embed = new Discord.RichEmbed()
    .setColor(pinku)
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
    .setAuthor(`${member.displayName} Profile (${user.id})`, user.displayAvatarURL)
    .setDescription('\u200b')
    .setThumbnail(user.displayAvatarURL)
    .addField('Level', uInfo.level + ' (' + uInfo.exp + ' xp)', true)
    .addField('Kanna Coins', uInfo.coins, true)
    .addField('Items', uInfo.items, true)
    .addField('Badges', uInfo.badges, true);

    await message.channel.send({embed});
    }
    else
    {
      const embed = new Discord.RichEmbed()
      .setColor(pinku)
      .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
      .setAuthor(`${member.displayName} Profile (${user.id})`, user.displayAvatarURL)
      .setDescription('\u200b')
      .setThumbnail(user.displayAvatarURL)
      .addField('Level', uInfo.level + ' (' + uInfo.exp + ' xp)', true)
      .addField('Kanna Coins', uInfo.coins, true)
      .addField('Items', uInfo.items, true)
      .addField('Badges', uInfo.badges, true);
      await message.channel.send({embed});
    }
  }
}
