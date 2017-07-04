const Database = require('../Database');
const table = require('./tables');

module.exports = class system
{
  static addExp(amount, user, member, message)
  {
    if(typeof amount !== 'number') throw new Error('Amount must be a valid number!');
    if(typeof message !== 'object') throw new Error('Message must be an object!')
    const result = await table.stats(Database.connection, 'stats', user.id);
    var uInfo = table. userStat(result);

    level = uInfo.level;
    xp = uInfo.exp;
    xpNeeded  = uInfo.baseExp;

    table.update(Database.connection, 'stats', {xp: xp + amount}, user.id);

    if(xp > xpNeeded)
    {
      table.update(Database.connection, 'stats',
      {
        level: ++level,
        baseExp: xpNeeded * 1.2,
        exp: 0
      }, user.id);
      message.channel.send(`You've reached Level **${level}**, congratulations ${member.displayName.toString()}! <:oh:315264555859181568>`);
    }

    if(xp % 10)
    {
      let newBadge = uInfo.badges.push(`Level ${level} badge`);
      table.update(Database.connection, 'stats', {badges: newBadge}, user.id);
      message.channel.send(`You've got the \`Level ${level} badge\``);
    }
}
