const Command = require('../../cogs/commands/framework');
const { Guild } = require('./../../data/Models');

module.exports = class QuizPhoto extends Command {
  constructor() {
    super({
      alias : ['qphoto'],
      name : 'quizphoto',
      category : 'dtamer',
      usage : 'quizphoto <option> <name>',
      exp : 0,
      coins : 0,
      permLevel : 1,
      enabled : true,
      description : 'Change the photo of the quiz character!',
      example : ['quizphoto view', 'quiphoto set [some valid link](https://static.comicvine.com/uploads/original/11120/111201214/4317240-azua3.jpg)']
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
    if ((!args[1] && args[0] !== option[0]) || !message.content.includes('http')) {
      await message.channel.send(`${message.author} you must input a link!`);
      return;
    }

    if (args[0] === option[1]) {
      g.quiz.character = args[1];
      await message.channel.send(`Modified Quiz Character Photo to **${args[1]}**`);
    } else {
      await message.channel.send(`Character current name: ${g.quiz.character}`);
      return;
    }
    g.save();
  }
}
