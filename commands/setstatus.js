const Command = require('../engine/commandClass');
const Discord = require('discord.js');

module.exports = class SetStatus extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['ss'],
      name: 'setstatus',
      category: 'unique',
      exp: 0,
      coins: 0,
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    if(!args[0]) return message.channel.send(`Really ${message.author}? Args man, ARGS!`);

    let options = ['online', 'dnd', 'idle', 'invisible'];

    if(!options.includes(args[0])) return message.channel.send(`Invalid status... \`${options.join('` | `')}\` if u forget `)

    if(client.user.presence.status === args[0]) return message.channel.send(`Wait but... I'm already ${args[0]}... <:tired:315264554600890390>`)

    await client.user.setStatus(args[0]);

    await message.channel.send(`Changed status to ${args[0]}`);
  }
}
