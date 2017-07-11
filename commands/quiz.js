const Command = require('../engine/commandClass');
const Guild = require('../engine/Guild');
const Discord = require('discord.js');

module.exports = class Quiz extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['qinfo'],
      name: 'quiz',
      category: 'event',
      usage: 'quiz <option> <value>',
      exp: 0,
      coins: 0,
      cooldown: 30000,
      permLevel: 1,
      enabled: true
    })
  }

  async run(client, message, color, args)
  {
    if(args[0])
    {
      let key = args[0];
      let value = args[1];

      let keys = require('../util/settings').table.guilds.quizOptions;

      if(!keys.includes(key.toLowerCase())) return message.channel.send(`Hey ${message.author}! \n\nYou've input an option that doesn't exist! The available options are\n\n\`${keys.join('` | `')}\``);

      if(!value && key !== keys[2] && key !== keys[3]) return message.channel.send(`${message.author} the option **${key}** must have a value!\n\nUsage: \`kanna pls ${this.usage}\``);

      const stats = await Guild.stats(message.guild);

      if(key === keys[0])
      {
        await Guild.modify(message.guild,
        {
          firstName: value,
          lastName: args.slice(2).join(' ') || ''
        });

        await message.channel.send(`Modified Quiz Character Name to: **${value + ' ' + args.slice(2).join(' ') || ''}**`);
      }
      if(key === keys[1])
      {
        await Guild.modify(message.guild,
        {
          quizPhoto: value
        });

        await message.channel.send(`Modified Quiz Character Photo to: **${value}**`);
      }
      if(key === keys[2])
      {
        let embed = require('../util/embeds').common(color, message)
        .setAuthor(`${message.member.displayName} started this event`, message.author.displayAvatarURL)
        .setImage(stats.quizPhoto)
        .addField('Try to guess who this is!', 'This even will be over in 15 minutes.')
        .setThumbnail(message.guild.iconURL);

        await message.channel.send({embed});

        let filter = function(response)
        {
          if(stats.lastName.length < 1)
          {
            return response.content.startsWith(stats.firstName) || response.content.startsWith(stats.firstName.toLowerCase());
          }
          return response.content.startsWith(stats.firstName) || response.content === stats.lastName || response.content === stats.lastName.toLowerCase() || response.content.startsWith(stats.firstName.toLowerCase()) || response.content.startsWith(stats.lastName);
        }

        let collected = await message.channel.awaitMessages(response => filter(response), {max: 1, time : 900000, errors: ['time']}).catch(async() =>
        {
          embed = new Discord.RichEmbed()
          .setFooter(`${message.member.displayName} started this event`, message.author.displayAvatarURL)
          .setAuthor(`${message.guild.name} Quiz Event`, message.guild.iconURL)
          .setColor(color)
          .setDescription('No one guessed it right, so the event has ended!')
          .addField('Character Name', stats.firstName + ' ' + stats.lastName)
          .setThumbnail(message.guild.iconURL)
          .setImage(stats.quizPhoto);
          await message.channel.send({embed});
        });

        if(collected.first())
        {
          embed = new Discord.RichEmbed()
          .setFooter(`${message.member.displayName} started this event`, message.author.displayAvatarURL)
          .setAuthor(`${message.guild.name} Quiz Event`, message.guild.iconURL)
          .setColor(color)
          .setDescription(`${collected.first().author} won this event!`)
          .addField('Character Name', stats.firstName + ' ' + stats.lastName)
          .setThumbnail(message.guild.iconURL)
          .setImage(stats.quizPhoto);
          await message.channel.send({embed});
        }
      }
      if(key === keys[3])
      {
        if(!message.guild.me.permissions.has('ADD_REACTIONS')) return message.channel.send(`I don't have permission to add reactions!`);

        const embed = new Discord.RichEmbed()
        .setTitle('React with the option you want!')
        .setDescription(`${message.author} this will change current quiz.`)
        .addField('Dragons', `\:one: **Tohru**\n\:two: **Quetzalcoatl**\n\:three: **Fafnir**\n\:four: **Elma**\n\:five: **Kanna Kamui**\n<:omfg:315264558279426048> **Ilulu**`)
        .addField('Humans', `\:six: **Kobayashi**\n\:seven: **Makoto Takiya**\n\:eight: **Magatsuchi Shouta**\n\:nine: **Saikawa Riko**`)
        .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
        .setColor(color)
        .setTimestamp()
        .setThumbnail(message.guild.iconURL);

        let msg = await message.channel.send({embed});

        var reacEmo = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '315264558279426048', '6⃣', '7⃣', '8⃣', '9⃣'];

        for (let emoji of reacEmo)
        {
          await msg.react(emoji);
        }

        let filter = (r, u) =>
        {
          return reacEmo.includes(r.emoji.id || r.emoji.name) && u.id === message.author.id;
        }

        let collector = msg.createReactionCollector(filter, {max : 1, time : 900000});

        collector.on('collect', async(c) =>
        {
          if(c.emoji.name === '1⃣')
          {
            await require('../engine/Guild').modify(message.guild,
            {
              quizPhoto: 'https://cdn-images-1.medium.com/max/1280/0*sh_VM38909y2PtYQ.jpg',
              firstName: 'Tohru',
              lastName: ''
            });
            await message.channel.send(`${message.author} i have sucessfully changed to **Tohru** pre-made set-up!`);
          }
          if(c.emoji.name === '2⃣')
          {
            await require('../engine/Guild').modify(message.guild,
            {
              quizPhoto: 'https://myanimelist.cdn-dena.com/images/characters/4/322674.jpg',
              firstName: 'Quetzalcoatl',
              lastName: ''
            });
              await message.channel.send(`${message.author} i have sucessfully changed to **Quetzalcoatl** pre-made set-up!`);
          }
          if(c.emoji.id === '315264558279426048')
          {
            await require('../engine/Guild').modify(message.guild,
            {
              quizPhoto: 'https://vignette2.wikia.nocookie.net/maid-dragon/images/3/3d/IluluManga.png/revision/latest?cb=20170304002454',
              firstname: 'Ilulu',
              lastName: ''
            });
            await message.channel.send(`${message.author} i have sucessfully changed to **Ilulu** pre-made set-up!`);
          }
          if(c.emoji.name === '3⃣')
          {
            await require('../engine/Guild').modify(message.guild,
            {
              quizPhoto: 'https://i.ytimg.com/vi/CCAYUrzeGoM/maxresdefault.jpg',
              firstName: 'Fafnir',
              lastName: ''
            });
            await message.channel.send(`${message.author} i have sucessfully changed to **Fafnir** pre-made set-up!`);
          }
          if(c.emoji.name === '4⃣')
          {
            await require('../engine/Guild').modify(message.guild,
            {
              quizPhoto: 'https://i.ytimg.com/vi/lOLVU9A3fq8/maxresdefault.jpg',
              fisrtName: 'Elma',
              lastName: ''
            });
            await message.channel.send(`${message.author} i have sucessfully changed to **Elma** pre-made set-up!`);
          }
          if(c.emoji.name === '5⃣')
          {
            await require('../engine/Guild').modify(message.guild,
            {
              quizPhoto: 'https://myanimelist.cdn-dena.com/images/characters/7/322911.jpg',
              firstName: 'Kanna',
              lastName: 'Kamui'
            });
            await message.channel.send(`${message.author} i have sucessfully changed to my own set-up!`);
          }
          if(c.emoji.name === '6⃣')
          {
            await require('../engine/Guild').modify(message.guild,
            {
              quizPhoto: 'https://myanimelist.cdn-dena.com/images/characters/10/317876.jpg',
              firstName: 'Kobayashi',
              lastName: ''
            });
            await message.channel.send(`${message.author} i have sucessfully changed to **Kobayashi-san** pre-made set-up!`)
          }
          if(c.emoji.name === '7⃣')
          {
            await require('../engine/Guild').modify(message.guild,
            {
              quizPhoto: 'https://myanimelist.cdn-dena.com/images/characters/4/317870.jpg',
              firstName: 'Makoto',
              lastName: 'Takiya'
            });
            await message.channel.send(`${message.author} i have sucessfully changed to **Makoto Takiya** pre-made set-up!`)
          }
          if(c.emoji.name ===  '8⃣')
          {
            await require('../engine/Guild').modify(message.guild,
            {
              quizPhoto: 'https://68.media.tumblr.com/104abedcd97ce15a51ed3238091aedff/tumblr_op4vnkjh9g1uctmvwo7_1280.png',
              firstName: 'Shouta',
              lastName: 'Magatsuchi'
            });
            await message.channel.send(`${message.author} i have sucessfully changed to **Shouta Magatsuchi** pre-made set-up!`)
          }
          if(c.emoji.name ===  '9⃣')
          {
            await require('../engine/Guild').modify(message.guild,
            {
              quizPhoto: 'https://myanimelist.cdn-dena.com/images/characters/8/323304.jpg',
              firstName: 'Saikawa',
              lastName: 'Riko'
            });
            await message.channel.send(`${message.author} i have sucessfully changed to **Saikawa Riko** pre-made set-up!`)
          }
        });
      }
    }
    else
    {
      const stats = await Guild.stats(message.guild);
      const embed = require('../util/embeds').common(color, message)
      .setAuthor(`${message.guild.name} Quiz Info`, message.guild.iconURL)
      .setDescription('\u200b')
      .addField('Character Name', stats.firstName + ' ' + stats.lastName)
      .addField('Character Photo', '\u200b')
      .setImage(stats.quizPhoto)
      .setThumbnail(message.guild.iconURL);

      await message.channel.send({embed});
    }
  }
}
