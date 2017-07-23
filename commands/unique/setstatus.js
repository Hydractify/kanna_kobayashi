const Command = require('../../cogs/commands/framework');
const Discord = require('discord.js');
const { client } = require('../../cogs/connections/discord');

module.exports = class SetStatus extends Command
{ constructor()
  { super(
    { alias: ['ss'],
      name: 'setstatus',
      exp: 0,
      coins: 0,
      enabled: true	});	}

  async run(message, color, args)
  { if (!args[0]) return message.channel.send(`Really ${message.author}? Args man, ARGS!`);

    let options = ['online', 'dnd', 'idle', 'invisible'];

    if(!options.includes(args[0])) return message.channel.send(`Invalid status... \`${options.join('` | `')}\` if u forget `)

    if(client.user.presence.status === args[0]) return message.channel.send(`Wait but... I'm already ${args[0]}... <:tired:315264554600890390>`)

    await client.user.setStatus(args[0]);

    await message.channel.send(`Changed status to ${args[0]}`);	}	}