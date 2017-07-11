const Discord = require('discord.js');
const Command = require('../engine/commandClass');
const get = require('../util/get');
const perm = require('../util/userPerm');
const { stack } = require('../util/err');

module.exports = class SoftBan extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['softbanne'],
      name: 'softban',
      category: 'mod',
      usage: 'softban <user>',
      permLevel: 2,
      exp: 0,
      coins: 0,
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    if(!message.guild.me.permissions.has('BAN_MEMBERS')) return await message.channel.send(`I don't have permission to softban members ${message.author}!`);
    if(!message.member.permissions.has('BAN_MEMBERS')) return await message.channel.send(`You don't have permission to softban anyone ${message.author}!`);
    if(!args[0]) return await message.channel.send(`${message.author}... You must specify a user so i can softban him <:omfg:315264558279426048>`);

    let member = await get.memberu(client, message, args);
    let userPerm = perm.check(client, member, message);

    if(userPerm >= 2) return message.channel.send(`I can't softban this member ${message.author}`);

    if(!member.bannable) return message.channel.send(`I can't softban this member ${message.author}`);

    await member.ban(2)
    .catch(e =>
    {
      return stack(e, message);
    });
    await message.guild.unban(member.user);
    await message.channel.send(`**${member.user.tag}** was sucessfully softbanned!`);
  }
}
