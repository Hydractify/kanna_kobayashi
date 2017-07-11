const Command = require('../engine/commandClass');
const get = require('../util/get');

module.exports = class Cuterate extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['kawaiirate', 'cuteness', 'kawaiiness'],
      name: 'cuterate',
      example: ['cutemeter @Wizardλ#4559'],
      usage: 'cutemeter <user>',
      category: 'int',
      enabled: true
    });
  }

  async run(client, message, color, args, perms, rest)
  {
    let member;

    if(args[0])
    {
      member = await get.memberu(client, message, args);

      if(!member) return;
    }

    let msg = rest.startsWith('cute') ? 'cute' : 'kawaii';

    let range = Math.floor(Math.random() * 100);

    if(!args[0] || member.user.id === message.author.id)
    {
      await message.channel.send(`${message.author} you are \`${range}%\` ${msg} <:ayy:315270615844126720>`);
    }
    else if(member.user.id === client.user.id)
    {
      await message.channel.send(`I am really ${msg} ${message.author} <:omfg:315264558279426048>`);
    }
    else if(require('../util/settings').client.devs.includes(member.user.id))
    {
      await message.channel.send(`${member.toString()} is \`100%\` ${msg} <:ayy:315270615844126720>`);
    }
    else
    {
      await message.channel.send(`${member.toString()} is \`${range}%\` ${msg} <:ayy:315270615844126720>`);
    }
  }
}
