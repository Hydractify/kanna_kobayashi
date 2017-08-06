const Discord = require('discord.js');
const Command = require('../../cogs/commands/framework');
const { Guild } = require('./../../data/Models');
const common = require('../../util/embeds/common');

module.exports = class QuizStart extends Command {
  constructor() {
    super({
      alias : ['qstart'],
      name : 'quizstart',
      category : 'dtamer',
      usage : 'quizstart',
      exp : 0,
      coins : 0,
      permLevel : 1,
      enabled : true,
      description : 'Start a Quiz event!'
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

    let embed = common(color, message)
    .setAuthor(`${message.member.displayName} started this event`, message.author.displayAvatarURL)
    .setImage(g.quiz.character)
    .addField('Try to guess who this is!', 'This even will be over in 15 minutes.')
    .setThumbnail(message.guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png');

    await message.channel.send({embed});

    let firstName = g.quiz.answer.split(' ')[0];
    let lastName = g.quiz.answer.split(' ').slice(1).join(' ')

    let filter = function(response) {
      if(lastName.length < 1) {
        return response.content.startsWith(firstName) || response.content.startsWith(firstName.toLowerCase());
      }
      return response.content.startsWith(firstName) || response.content === lastName || response.content === lastName.toLowerCase() || response.content.startsWith(firstName.toLowerCase()) || response.content.startsWith(lastName);
    }

    let collected = await message.channel.awaitMessages(response => filter(response), {max: 1, time : 900000, errors: ['time']}).catch(async() => {
      embed = new Discord.RichEmbed()
      .setFooter(`${message.member.displayName} started this event`, message.author.displayAvatarURL)
      .setAuthor(`${message.guild.name} Quiz Event`, message.guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png')
      .setColor(color)
      .setDescription('No one guessed it right, so the event has ended!')
      .addField('Character Name', g.quiz.answer)
      .setThumbnail(message.guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png')
      .setImage(g.quiz.character);
      await message.channel.send({embed});
    });

    if(collected.first()) {
      embed = new Discord.RichEmbed()
      .setFooter(`${message.member.displayName} started this event`, message.author.displayAvatarURL)
      .setAuthor(`${message.guild.name} Quiz Event`, message.guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png')
      .setColor(color)
      .setDescription(`${collected.first().author} won this event!`)
      .addField('Character Name', g.quiz.answer)
      .setThumbnail(message.guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png')
      .setImage(g.quiz.character);
      await message.channel.send({embed});
    }
  }
}
