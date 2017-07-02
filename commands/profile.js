const Discord = require('discord.js');
const Command = require('../engine/commandClass.js');
const table = require('../engine/db/tables');
const Users = require('../engine/User');
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
    let memberu = 'Oh fuck.'
    if(args[0] || message.mentions.size >= 1)
    {
      user = await get.user(client, message, args);
      if(typeof user === 'object')
      {
        if(user.bot) return message.channel.send(`Bots don't have profiles!`);
      }
    }

    if(!user) return;

    const member = await message.guild.member(user);
    const result = await table.stats('stats', user.id);

    if(result.length < 1)
    {
      await table.insert('stats',
    {
      id: user.id,
      level: 1,
      exp: 0,
      coins: 100,
      items: [],
      badges: [],
      baseExp: 100
    });

    let uInfo = await Users.stats(user);

    const embed = new Discord.RichEmbed()
    .setColor(pinku)
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
    .setAuthor(`${member.displayName} Profile (${user.id})`, user.displayAvatarURL)
    .setDescription('\u200b')
    .setThumbnail(user.displayAvatarURL)
    .addField('Level', uInfo.level + ' (' + uInfo.exp + ' xp)', true)
    .addField('Kanna Coins', uInfo.coins + ' <:coin:330926092703498240>', true)
    .addField('Items', uInfo.items, true)
    .addField('Badges', uInfo.badges, true);

    await message.channel.send({embed});
    }
    else
    {
      let uInfo = await Users.stats(user);

      const embed = new Discord.RichEmbed()
      .setColor(pinku)
      .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
      .setAuthor(`${member.displayName} Profile (${user.id})`, user.displayAvatarURL)
      .setDescription('\u200b')
      .setThumbnail(user.displayAvatarURL)
      .addField('Level', uInfo.level + ' (' + uInfo.exp + ' xp)', true)
      .addField('Kanna Coins <:coin:330926092703498240>',  uInfo.coins, true)
      .addField('Items', uInfo.items, true)
      .addField('Badges', uInfo.badges, true);
      await message.channel.send({embed});
    }
  }
}
