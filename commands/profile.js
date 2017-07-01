const Discord = require('discord.js');
const Command = require('../engine/commandClass.js');
const r = require('rethinkdb');
const Database = require('../engine/Database');

module.exports = class Profile extends Command {
  constructor(client) {
    super(client, {
      alias: ['pf'],
      name: 'profile',
      usage: 'profile <user>',
      category: '',
      description: 'Look your own profile or of your friends!'
    })
  }

  async run(client, message, pinku, args) {
    let userInTable = await r.db('users').table('stats').filter(r.row('id').eq(message.author.id));
    const result = new require('../engine/users/users')(r, Database.connection, message.author.id).stats;
    const u = new require('../util/get')(client, message, result[0].id);
    if(!userInTable) {
      await r.db('users').table('stats').insert([
        {
          id: message.author.id,
          level: 1,
          exp: 0,
          coins: 100,
          items: [],
          badges: []
        }
      ]);
      const embed = new Discord.RichEmbed()
      .setColor(pinku)
      .setTimestamp()
      .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
      .setThumbnail(u.displayAvatarURL)
      .addField('Level', result[0].level + '\n(' + result[0].exp +')')
      .addField('Kanna Coins', result[0].coins)
      .setAuthor(`${u.tag} Profile`, u.displayAvatarURL);
      if(result[0].items === '')
      {
        embed.addField('Items', result[0].items.join(' '));
      } else if(result[0].badges === '')
      {
        embed.addField('Badges', result[0].badges.join(' '));
      }
      message.channel.send({embed});
    } else {
      await userInTable.run(Database.connection, async function(err, cursor) {
        if(err) throw err;
        cursor.toArray(async function(err, result) {
          if(err) throw err;
          const embed = new Discord.RichEmbed()
          .setColor(pinku)
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
          .setThumbnail(u.displayAvatarURL)
          .addField('Level', result[0].level + '\n(' + result[0].exp +')')
          .addField('Kanna Coins', result[0].coins)
          .setAuthor(`${u.tag} Profile`, u.displayAvatarURL);
          if(result[0].items === '') {
            embed.addField('Items', result[0].items.join(' '));
          } else if(result[0].badges === '') {
            embed.addField('Badges', result[0].badges.join(' '));
          }
          message.channel.send({embed});
        })
      });
    }
    message.channel.send('wew');
  }
}
