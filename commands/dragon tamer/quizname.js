const Command = require('../../cogs/commands/framework');
const { Guild } = require('./../../data/Models');

module.exports = class QuizName extends Command {
  constructor() {
    super({
      alias : ['qname'],
      name : 'quizname',
      category : 'dtamer',
      usage : 'quizname <option> <name>',
      exp : 0,
      coins : 0,
      permLevel : 1,
      enabled : true,
      description : 'Change the name of the quiz character!',
      example : ['quizname view', 'quizname set Dio Brando']
    });
  }

  async run (message, color, args) {
    if (!args[0]) {
      await message.channel.send(`${message.author} you have to input a value and a key \`${this.usage}\``);
      return;
    }

    let g;
    try {
      g = await Guild.get(message.guild.id).run();
    } catch (err) {
      g = new Guild({
        id : message.guild.id
      });
    }

    let option = ['view', 'set'];

    if (!option.includes(args[0].toLowerCase())) {
      await message.channel.send(`${message.author} you need to input a valid option!`);
      return;
    }
    if (!args[1] && args[0] !== option[0]) {
      await message.channel.send(`${message.author} you must input a name!`);
      return;
    }
    if (g.quiz.answer === args[1] + ' ' + (args.slice(2).join(' ') || '')) {
      await message.channel.send(`${message.author} you have tried to set the name as the current one!`);
      return;
    }

    if (args[0] === option[1]) {
      g.quiz.answer = args[1] + ' ' + (args.slice(2).join(' ') || '');
      await message.channel.send(`${message.author} i have sucessfully modified the name to **${args[1] + ' ' + (args.slice(2).join(' ') || '')}**`);
    } else {
      await message.channel.send(`${message.author} the character current name is: **${g.quiz.answer}**`);
      return;
    }
    g.save();
  }
}
