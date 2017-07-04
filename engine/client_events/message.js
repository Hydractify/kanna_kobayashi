const settings = require('../../util/settings.json');
const gg = require('../Guild');
const table = require('../db/tables');

module.exports = async message => {
  try{
  let client = message.client;

  if (message.author.bot) return;

  const checkPrefix = (message) => settings.prefix.some(p=> message.content.startsWith(p)) || new RegExp(settings.prefix[1]).test(message.content);

  if(!checkPrefix(message)) return;

  const tingle = (message) => {
    for (let p of settings.prefix) {
        let regex = new RegExp(`^${p}([^]*)`);
        let match = message.content.match(regex);
        if(match) return match[1];
    }
    return null;
}

  let rest = tingle(message);
  if(!rest) return;
  if (message.channel.type !== 'text') return;
  if(message.guild.members.filter(m => m.user.bot).size > message.guild.members.filter(m => !m.user.bot).size && message.guild.members.size > 50) {
    await message.channel.send('This guild haves more bots than humans! I won\'t answer any commands >;(\n\nIf you aren\'t a bot collector and want to be whitelisted join  the official guild and ping the support (@Support)\nhttps://discord.gg/uBdXdE9');
  }
  if(!message.guild.member(client.user.id).permissions.has('SEND_MESSAGES')) {
    await message.guild.owner.send(`I don\'t have permission to talk in **${message.guild.name}** in the channel **${message.channel}**`)
  }
  let command = rest.split(' ')[0];
  let args = rest.split(' ').slice(1);
  let perms = client.userPerms(message);
  let pinku = require('color-convert').hsv.hex(Math.random()*(350 - 250)+250, Math.random()*(100 - 50)+50, Math.random()*(100 - 50)+50);
  if(perms === 4) pinku = '#5f67c2';
  if(perms === 3) pinku = '#c353b2';
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    if(!cmd.enabled){
      await message.channel.send(`${message.member.toString()}, **${cmd.name}** is disabled at this moment.`);
      return;
    }
    if(cmd.permLevel === 1){
      permError = 'the Dragon Tamer role assigned to yourself'
    } else if(cmd.permLevel === 2){
      permError = 'to have enough permissions on the roles assigned to you'
    }else if(cmd.permLevel === 3){
      permError = 'to be on a high rank role on the official guild'
    } else if(cmd.permLevel === 4){
      permError = 'to be the owner'
    }
    if (perms < cmd.permLevel) return await message.channel.send(`${message.author} you don't have enough permission to use that command. You need ${permError} to use that command!`);
    await cmd.run(client, message, pinku, args, perms, rest);
  }
}catch(err) {
  console.log(err.stack);
}
};
