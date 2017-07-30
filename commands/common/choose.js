const Command = require('../../cogs/commands/framework');

module.exports = class Choose extends Command {
  constructor() {
    super({
      alias: ['choice'],
      name: 'choose',
      example: ['choose Tohru|Kanna', 'choose Tohru Kanna'],
      enabled: true
    });
  }

  async run(message, color, args) {
    if (!args) return message.channel.send(`${message.author} you have to input arguments!`);
    let pP;
    if (args.toString().includes('|')) {
      pP = args.join(' ').split('|');
    } else if (args.toString().includes('or')) {
      pP = args.join(' ').split('or');
    } else {
      pP = args;
    }
    let answer = pP[Math.floor(Math.random() * pP.length)];
    answer = answer.replace(' ', '') || answer;
    await message.channel.send(`I choose **${answer}**`);
  }
}
