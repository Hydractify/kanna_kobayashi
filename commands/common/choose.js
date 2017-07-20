const Command = require('../../cogs/commands/framework'); 

module.exports = class Choose extends Command
{ constructor()
  { super(
    { alias: ['choice'],
      name: 'choose',
      example: ['choose Tohru|Kanna', 'choose Tohru Kanna'],
      enabled: true	});	}

  async run(message, color, args)
  { if (!args) return message.channel.send(`${message.author} you have to input arguments!`);
	if (!args[1]) return message.channel.send(`I choose **Please provide me more than 1 thing to choose from** ... ~~as **${args[0]}** is the only option you provided to me~~`);
	if (args.toString().includes('|'))
	{	var pP = args.join(' ').split('|');	} 
	else 
	{	var pP = args;	}
    var answer = pP[Math.floor(Math.random() * pP.length)];
    await message.channel.send(`I choose **${answer}**`);	}	}
