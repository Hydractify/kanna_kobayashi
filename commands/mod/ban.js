const Command = require('../../cogs/commands/framework');
const fetchMember = require('../../util/fetch/member');
const permCheck = require('../../util/client/check_perm');
const error = require('../../util/client/error/stack');

module.exports = class Ban extends Command {
  constructor() {
    super({
      alias: ['banne'],
      name: 'ban',
      usage: 'ban <user>',
      permLevel: 2,
      exp: 0,
      coins: 0,
      enabled: true
    });
  }

  async run(message, color, args) {
    if(!message.guild.me.permissions.has('BAN_MEMBERS')) {
      await message.channel.send(`I don't have permission to ban members ${message.author}!`);
      return;
    }
    if(!message.member.permissions.has('BAN_MEMBERS')) {
      await message.channel.send(`You don't have permission to ban anyone ${message.author}!`);
      return;
    }

    if(!args[0]) return message.channel.send(`${message.author}... You must specify a user so i can ban him <:omfg:315264558279426048>`);

    let member = await fetchMember(message, args);
    let userPerm = permCheck(member, message);

    if(userPerm >= 2 || !member.bannable) {
      await message.channel.send(`I can't ban this member ${message.author}`);
      return;
    }

    member.ban(2)
    .catch(e => {
      error(e, message, this);
      return;
    });
    await message.channel.send(`**${member.user.tag}** was sucessfully banned!`);
  }
}
