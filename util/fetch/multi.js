const { Message } = require('discord.js');
const memberu = require('./member');

module.exports = async (message, args) => {
  if (!message || !args)
  {	throw new Error('The member (fetchMember) function takes 3 parameters: client, message and args!');	}

  if (!(message instanceof Message)) throw new Error('The message parameter is not instanceof Message!');
  if (!(args instanceof Array)) throw new Error('The args parameter is not instanceof Array!');

  let member;
  if (args.length == 1) {
    member = await memberu(message, args);
    if (!member) return;
    return member;
  } else {
    let members = [];
    for (const arg of args) {
      let fakeArgs = [arg];
      member = await memberu(message, fakeArgs);
      if (!member) return;
      members.push(member);
    }
    return members;
  }
}
