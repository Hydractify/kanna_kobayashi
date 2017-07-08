const Command = require('../engine/commandClass');
const get = require('../util/get');

module.exports = class FutaMeter extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['trap'],
      name: 'futa',
      example: ['futa @Wizardλ#4559'],
      usage: 'futa <user>',
      category: 'int'
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

    let msg = rest.startsWith('futa') ? 'futa' : 'trap';

    let range = Math.floor(Math.random() * 100);

    if(!args[0] || member.user.id === message.author.id)
    {
      await message.channel.send(`${message.author} there's a \`${range}%\` chance of you being a ${msg} <:lewd:320406420824653825> `);
    }
    else if(member.user.id === client.user.id)
    {
      await message.channel.send(`How dare you ${message.author}! <:omfg:315264558279426048>`);
    }
    else if(require('../util/settings').client.devs.includes(member.user.id))
    {
      await message.channel.send(`No one knows ${message.author} 👀`);
    }
    else
    {
      await message.channel.send(`${member.toString()} there's a \`${range}%\` chance of you being a ${msg} <:lewd:320406420824653825>`);
    }
  }
}
