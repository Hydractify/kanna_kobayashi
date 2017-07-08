const Discord = require('discord.js');
const Command = require('../engine/commandClass');
const get = require('../util/get');
const perm = require('../util/userPerm');
const { stack } = require('../util/err');

module.exports = class Kick extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['fuckoff'],
      name: 'kick',
      category: 'mod',
      usage: 'kick <user>',
      permLevel: 2,
      exp: 0,
      coins: 0
    });
  }

  async run(client, message, color, args)
  {
    if(!message.guild.me.permissions.has('KICK_MEMBERS')) return await message.channel.send(`I don't have permission to kick members ${message.author}!`);
    if(!message.member.permissions.has('KICK_MEMBERS')) return await message.channel.send(`You don't have permission to kick anyone ${message.author}!`);
    if(!args[0]) return await message.channel.send(`${message.author}... You must specify a user so i can kick him <:omfg:315264558279426048>`);

    let member = await get.memberu(client, message, args);
    let userPerm = perm.check(client, member, message);

    if(userPerm >= 2) return message.channel.send(`I can't kick this member ${message.author}`);

    if(!member.kickable) return message.channel.send(`I can't kick this member ${message.author}`);

    await member.kick()
    .catch(e =>
    {
      return stack(e, message);
    });
    await message.channel.send(`**${member.user.tag}** was sucessfully kicked!`);
  }
}
