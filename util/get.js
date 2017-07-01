const sendErr = require('./err').user;

module.exports = class get {

  static async memberu(client, message, args)
    {
      if(typeof client !== 'object') throw new Error('Client isn\'t correctly defined!');
      if(typeof message !== 'object') throw new Error('Message isn\'t correctly defined!');
      if(!Array.isArray(args)) throw new Error('Arguments must be an Array!');

      let resolvable = args[0];

      if(message.mentions.users.size >= 1)
      {
        resolvable = message.mentions.users.first();
      }
      else if(message.guild.members.find(m => m.user.tag.toLowerCase().includes(args[0].toLowerCase())))
      {
        resolvable = message.guild.members.find(m => m.user.tag.toLowerCase().includes(args[0].toLowerCase()));
      }
      else if(message.guild.members.find(m => m.displayName.toLowerCase().includes(args[0].toLowerCase())))
      {
        resolvable = message.guild.members.find(m => m.displayName.toLowerCase().includes(args[0].toLowerCase()));
      }

    return message.guild.fetchMember(resolvable)
      .catch(e =>
        {
          sendErr(resolvable);
        });
  }

  static user(client, message, args)
  {
    if(typeof client !== 'object') throw new Error('Client isn\'t correctly defined!');
    if(typeof message !== 'object') throw new Error('Message isn\'t correctly defined!');
    if(!Array.isArray(args)) throw new Error('Arguments must be an Array!');

    let resolvable = args[0];

    if(message.mentions.users.size >= 1)
    {
      resolvable = message.mentions.users.first().id;
    }
    else if(message.guild.members.find(m => m.user.tag.toLowerCase().includes(args[0].toLowerCase())))
    {
      resolvable = message.guild.members.find(m => m.user.tag.toLowerCase().includes(args[0].toLowerCase())).user.id;
    }
    else if(message.guild.members.find(m => m.displayName.toLowerCase().includes(args[0].toLowerCase())))
    {
      resolvable = message.guild.members.find(m => m.displayName.toLowerCase().includes(args[0].toLowerCase())).user.id;
    }

    return client.fetchUser(resolvable)
    .catch(e =>
    {
      sendErr(resolvable);
    });
  }

  static members(message) {
    if(typeof message !== 'object') throw new Error('Message isn\'t correctly defined!');

    return message.guild.fetchMembers()
    .catch(e =>
      {
        return require('./err').stack(e);
      });
  }
}
