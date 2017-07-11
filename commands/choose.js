const Command = require('../engine/commandClass');

module.exports = class Choose extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['choice'],
      name: 'choose',
      example: ['choose Tohru|Kanna', 'choose Tohru Kanna'],
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    if(!args) return await message.channel.send(`${message.author} you have to input arguments!`);
    if(args.toString().includes('|')){
      var pP = args.join(' ').split('|');
    } else {
      var pP = args;
    }
    var answer = pP[Math.floor(Math.random() * pP.length)];
    await message.channel.send(`I choose **${answer}**`);
  }
}
