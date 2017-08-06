const Command = require('../../cogs/commands/framework');
const memberu = require('../../util/fetch/member');
const permCheck = require('../../util/client/check_perm');
const stack = require('../../util/client/error/stack');

module.exports = class Kick extends Command {
  constructor() {
    super({
      alias: ['fuckoff'],
      name: 'kick',
      usage: 'kick <user>',
      permLevel: 2,
      exp: 0,
      coins: 0,
      enabled: true
    });
  }

  async run(message, color, args) {
    if(!message.guild.me.permissions.has('KICK_MEMBERS')) {
      await message.channel.send(`I don't have permission to kick members ${message.author}!`);
      return;
    }
    if(!message.member.permissions.has('KICK_MEMBERS')) {
      await message.channel.send(`You don't have permission to kick anyone ${message.author}!`);
      return;
    }
    if(!args[0]) {
      await message.channel.send(`${message.author}... You must specify a user so i can kick him <:omfg:315264558279426048>`);
      return;
    }

    let member = await memberu(message, args);
    let userPerm = permCheck(member, message);

    if(userPerm >= 2 || !member.kickable) {
      await message.channel.send(`I can't kick this member ${message.author}`);
      return;
    }

    await member.kick()
    .catch(e => {
      return stack(e, message);
    });
    await message.channel.send(`**${member.user.tag}** was sucessfully kicked!`);
  }
}
