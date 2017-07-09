const Command = require('../engine/commandClass');
const Discord = require('discord.js');

module.exports = class PreMadeQuiz extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['qpmd', 'premadequiz'],
      name: 'qpremade',
      permLevel: 1,
      exp: 0,
      coins: 0,
      cooldown: 30000
    });
  }

  async run(client, message, color)
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
          quizPhoto: 'https://cdn.discordapp.com/attachments/296751851603230721/320687822623211521/tumblr_oj99iyqfqG1qkz08qo1_500.gif',
          firstName: 'Tohru',
          lastName: ''
        });
        await message.channel.send(`${message.author} i have sucessfully changed to **Tohru** pre-made set-up!`);
      }
      if(c.emoji.name === '2⃣')
      {
        await require('../engine/Guild').modify(message.guild,
        {
          quizPhoto: 'https://cdn.discordapp.com/attachments/303005425941479425/320689484310118400/tumblr_olfg91toYZ1r2r59eo1_1280.jpg',
          firstName: 'Quetzalcoatl',
          lastName: ''
        });
          await message.channel.send(`${message.author} i have sucessfully changed to **Quetzalcoatl** pre-made set-up!`);
      }
      if(c.emoji.id === '315264558279426048')
      {
        await require('../engine/Guild').modify(message.guild,
        {
          quizPhoto: 'https://cdn.discordapp.com/attachments/303005425941479425/320690371333980160/IluluManga.png',
          firstname: 'Ilulu',
          lastName: ''
        });
        await message.channel.send(`${message.author} i have sucessfully changed to **Ilulu** pre-made set-up!`);
      }
      if(c.emoji.name === '3⃣')
      {
        await require('../engine/Guild').modify(message.guild,
        {
          quizPhoto: 'https://cdn.discordapp.com/attachments/303005425941479425/320691076673568768/eacbb376e163ff1ea383b89b5a629c9d.png',
          firstName: 'Fafnir',
          lastName: ''
        });
        await message.channel.send(`${message.author} i have sucessfully changed to **Fafnir** pre-made set-up!`);
      }
      if(c.emoji.name === '4⃣')
      {
        await require('../engine/Guild').modify(message.guild,
        {
          quizPhoto: 'https://cdn.discordapp.com/attachments/303005425941479425/320691700978810890/maxresdefault_2.jpg',
          fisrtName: 'Elma',
          lastName: ''
        });
        await message.channel.send(`${message.author} i have sucessfully changed to **Elma** pre-made set-up!`);
      }
      if(c.emoji.name === '5⃣')
      {
        await require('../engine/Guild').modify(message.guild,
        {
          quizPhoto: 'https://cdn.discordapp.com/attachments/303005425941479425/320692118966501378/tumblr_ojzt52GXw51thzx08o1_500.gif',
          firstName: 'Kanna',
          lastName: 'Kamui'
        });
        await message.channel.send(`${message.author} i have sucessfully changed to my own set-up!`);
      }
      if(c.emoji.name === '6⃣')
      {
        await require('../engine/Guild').modify(message.guild,
        {
          quizPhoto: 'https://cdn.discordapp.com/attachments/303005425941479425/320691700978810890/maxresdefault_2.jpg',
          firstName: 'Kobayashi',
          lastName: ''
        });
        await message.channel.send(`${message.author} i have sucessfully changed to **Kobayashi-san** pre-made set-up!`)
      }
      if(c.emoji.name === '7⃣')
      {
        await require('../engine/Guild').modify(message.guild,
        {
          quizPhoto: 'https://cdn.discordapp.com/attachments/303005425941479425/320694387946291216/tumblr_oohv1zRk3b1tdj66po1_1280.png',
          firstName: 'Makoto',
          lastName: 'Takiya'
        });
        await message.channel.send(`${message.author} i have sucessfully changed to **Makoto Takiya** pre-made set-up!`)
      }
      if(c.emoji.name ===  '8⃣')
      {
        await require('../engine/Guild').modify(message.guild,
        {
          quizPhoto: 'https://cdn.discordapp.com/attachments/303005425941479425/320695931294973952/gx7JFaJ.png',
          firstName: 'Shouta',
          lastName: 'Magatsuchi'
        });
        await message.channel.send(`${message.author} i have sucessfully changed to **Shouta Magatsuchi** pre-made set-up!`)
      }
      if(c.emoji.name ===  '9⃣')
      {
        await require('../engine/Guild').modify(message.guild,
        {
          quizPhoto: 'https://cdn.discordapp.com/attachments/303005425941479425/320695263817760768/shouta.png',
          firstName: 'Saikawa',
          lastName: 'Riko'
        });
        await message.channel.send(`${message.author} i have sucessfully changed to **Saikawa Riko** pre-made set-up!`)
      }
    });
  }
}
