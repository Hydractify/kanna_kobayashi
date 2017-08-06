const Discord = require('discord.js');
const Command = require('../../cogs/commands/framework');
const { Guild } = require('./../../data/Models');

module.exports = class QuizPreMade extends Command {
  constructor() {
    super({
      alias : ['qpremade'],
      name : 'quizpremade',
      category : 'dtamer',
      usage : 'quizpremade',
      exp : 0,
      coins : 0,
      permLevel : 1,
      enabled : true,
      description : 'Choose a Quiz set-up of all the current Dragons you humans have knowledge of!'
    });
  }

  async run (message, color) {
    let g;
    try {
      g = await Guild.get(message.guild.id).run();
    } catch (err) {
      g = new Guild({
        id : message.guild.id
      });
    }

    if(!message.guild.me.permissions.has('ADD_REACTIONS')) {
      await message.channel.send(`I don't have permission to add reactions!`);
      return;
    }

    const embed = new Discord.RichEmbed()
    .setTitle('React with the option you want!')
    .setDescription(`${message.author} this will change current quiz.`)
    .addField('Dragons', `\:one: **Tohru**\n\:two: **Quetzalcoatl**\n\:three: **Fafnir**\n\:four: **Elma**\n\:five: **Kanna Kamui**\n<:omfg:315264558279426048> **Ilulu**`)
    .addField('Humans', `\:six: **Kobayashi**\n\:seven: **Makoto Takiya**\n\:eight: **Magatsuchi Shouta**\n\:nine: **Saikawa Riko**`)
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL)
    .setColor(color)
    .setTimestamp()
    .setThumbnail(message.guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png');

    let msg = await message.channel.send({embed});

    var reacEmo = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '315264558279426048', '6⃣', '7⃣', '8⃣', '9⃣'];

    for (let emoji of reacEmo) {
      await msg.react(emoji);
    }

    let filter = (r, u) => {
      return reacEmo.includes(r.emoji.id || r.emoji.name) && u.id === message.author.id;
    }

    let collector = msg.createReactionCollector(filter, {max : 1, time : 900000});

    collector.on('collect', async(c) => {
      if(c.emoji.name === '1⃣') {
        g.quiz.character = 'https://cdn-images-1.medium.com/max/1280/0*sh_VM38909y2PtYQ.jpg';
        g.quiz.answer = 'Tohru ';
        await message.channel.send(`${message.author} i have sucessfully changed to **Tohru** pre-made set-up!`);
      }
      if(c.emoji.name === '2⃣') {
        g.quiz.character = 'https://myanimelist.cdn-dena.com/images/characters/4/322674.jpg';
        g.quiz.answer = 'Quetzalcoat ';
        await message.channel.send(`${message.author} i have sucessfully changed to **Quetzalcoatl** pre-made set-up!`);
      }
      if(c.emoji.id === '315264558279426048') {
        g.quiz.character = 'https://vignette2.wikia.nocookie.net/maid-dragon/images/3/3d/IluluManga.png/revision/latest?cb=20170304002454';
        g.quiz.answer = 'Ilulu '
        await message.channel.send(`${message.author} i have sucessfully changed to **Ilulu** pre-made set-up!`);
      }
      if(c.emoji.name === '3⃣') {
        g.quiz.character = 'https://i.ytimg.com/vi/CCAYUrzeGoM/maxresdefault.jpg';
        g.quiz.answer = 'Fafnir '
        await message.channel.send(`${message.author} i have sucessfully changed to **Fafnir** pre-made set-up!`);
      }
      if(c.emoji.name === '4⃣') {
        g.quiz.character = 'https://i.ytimg.com/vi/lOLVU9A3fq8/maxresdefault.jpg';
        g.quiz.answer = 'Elma ';
        await message.channel.send(`${message.author} i have sucessfully changed to **Elma** pre-made set-up!`);
      }
      if(c.emoji.name === '5⃣') {
        g.quiz.character = 'https://myanimelist.cdn-dena.com/images/characters/7/322911.jpg';
        g.quiz.answer = 'Kanna Kamui';
        await message.channel.send(`${message.author} i have sucessfully changed to my own set-up!`);
      }
      if(c.emoji.name === '6⃣') {
        g.quiz.character = 'https://myanimelist.cdn-dena.com/images/characters/10/317876.jpg';
        g.quiz.answer = 'Kobayashi '
        await message.channel.send(`${message.author} i have sucessfully changed to **Kobayashi-san** pre-made set-up!`)
      }
      if(c.emoji.name === '7⃣') {
        g.quiz.character = 'https://myanimelist.cdn-dena.com/images/characters/4/317870.jpg';
        g.quiz.answer = 'Makoto Takiya';
        await message.channel.send(`${message.author} i have sucessfully changed to **Makoto Takiya** pre-made set-up!`)
      }
      if(c.emoji.name ===  '8⃣') {
        g.quiz.character = 'https://68.media.tumblr.com/104abedcd97ce15a51ed3238091aedff/tumblr_op4vnkjh9g1uctmvwo7_1280.png';
        g.quiz.answer = 'Shouta Magatsuchi'
        await message.channel.send(`${message.author} i have sucessfully changed to **Shouta Magatsuchi** pre-made set-up!`)
      }
      if(c.emoji.name ===  '9⃣') {
        g.quiz.character = 'https://myanimelist.cdn-dena.com/images/characters/8/323304.jpg';
        g.quiz.answer = 'Saikawa Riko';
        await message.channel.send(`${message.author} i have sucessfully changed to **Saikawa Riko** pre-made set-up!`)
      }
      collector.stop();
    });
    collector.on('end', async () => await msg.delete());
    g.save();
  }
}
