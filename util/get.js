const err = require('./err.js');

let get = {
  member: async(client, message, args, resolve) => {
    if(message.mentions.users.size >= 1) {
      resolvable = message.mentions.users.first();
    } else if(message.guild.members.find(m => m.displayName.toLowerCase().includes(args[0].toLowerCase()))) {
      resolvable = await client.fetchUser(message.guild.members.find(m => m.displayName.toLowerCase().includes(args[0].toLowerCase())).user.id);
    }
    console.log(resolvable);
     return message.guild.fetchMember(resolvable).then(resolve => {
       resolve;
     }).catch(e => {
       message.channel.send(err.user(args[0]));
     });
  },
  user: async(client, args, resolve) => {
    return client.fetchUser(args[0]).catch(e => {
      message.channel.send(err.user(args[0]));
    });
  },
  members: async(message, resolve) => {
    return message.guild.fetchMembers().then(resolve => {
      resolve;
    });
  }
}

module.exports = get;
