const sendErr = require('./err').user;

module.exports = class get {
  constructor(client, message, id, args)
  {
    if(typeof client !== 'object') throw new Error('Client isn\'t correctly defined!');
    if(typeof message !== 'object') throw new Error('Message isn\'t correctly defined!');
    if(!Array.isArray(args)) throw new Error('Arguments must be an Array!');
    if(!parseInt(id) || typeof id !== 'string') throw new Error('ID must be a string! (Example: 132879728132183)');
  }

  static get memberu()
    {
      if(message.mentions.users.size >= 1)
    {
      let resolvable = message.mentions.users.first();
    }
    else if(args[0].size === 18 && typeof parseInt(args[0]) === 'number')
    {
      let resolvable = client.fetchUser(args[0]);
    }
    message.guild.fetchMember(resolvable).then(m =>
      {
      const memberu = m;
      })
      .catch(e =>
        {
          return sendErr(args[0] || id);
        })
    return memberu;
  }

  static get user()
  {
    client.fetchUser(id).then(u =>
      {
        const user = u;
      })
      .catch(e =>
        {
          return sendErr(id);
        })
      return user;
  }

  static get members() {
    message.guild.fetchMembers().then(m =>
      {
        const members = m;
      }).catch(e =>
        {
          return require('./err').stack(e);
        })
      return members;
  }
}
