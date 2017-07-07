const r = require('rethinkdb');

module.exports = class Table
{

  static stats(table, id)
  {
    if(typeof id !== 'string') throw new Error('ID must be a string!');
    if(typeof table !== 'string') throw new Error('Table name must be a string!');

    let connection = require('../Database').connection;

    return r
      .db('users')
      .table(table)
      .filter(r.row('id').eq(id))
      .run(connection)
      .then(cursor => cursor.toArray());
  }

  static insert(table, options)
  {
    if(typeof options !== 'object') throw new Error('You must insert a valid object!');
    if(typeof table !== 'string') throw new Error('Table name must be a string!');

    let connection = require('../Database').connection;

    return r
    .db('users')
    .table(table)
    .insert(options)
    .run(connection);
  }

  static userStat(results, table)
  {
    if(typeof results !== 'object') throw new Error('Results must be an object!');
    if(typeof table !== 'string') throw new Error('Table must be a string!');
    if(table !== 'stats') throw new Error('This table works with Users stats! (The table you\'ve input isn\'t -stats-)');

    let result = results[0];

    let id = result.id;
    let level = result.level;
    let exp = result.exp;
    let coins = result.coins;
    let items = result.items.join(', ');
    let badges = result.badges.join(', ');
    let baseExp = result.baseExp;
    if(result.badges.length < 1) badges = 'None';
    if(result.items.length < 1) items = 'None';

    return {
      id,
      level,
      exp,
      coins,
      items,
      badges,
      baseExp
    }

  }

  static update(table, options, id)
  {
    if(typeof options !== 'object') throw new Error('You must insert a valid object!');
    if(typeof table !== 'string') throw new Error('Table name must be a string!');

    let connection = require('../Database').connection;

    return r
    .db('users')
    .table(table)
    .filter(r.row('id').eq(id))
    .update(options)
    .run(connection);
  }

  static guildStat(results, table)
  {
    if(typeof results !== 'object') throw new Error('Results must be an object!');
    if(typeof table !== 'string') throw new Error('Table must be a string!');
    if(table !== 'guilds') throw new Error('This table works with Guild stats! (The table you\'ve input isn\'t -guilds-)');

    let result = results[0];

    let id = result.id;
    let prefix = result.prefix;
    let levelUpMessages = result.levelUpMessages ? 'Enabled' : 'Disabled';
    let modrole = result.modrole;

    return {
      id,
      prefix,
      levelUpMessages,
      modrole,
      welcomeMessages
    }
  }

  static logCommand(id, command){
    let connection = require('../Database').connection;
    return r
        .table('command_log')
        .insert({id, command, timeUsed: Date.now()},
            {conflict: 'replace'})
        .run(connection);
  }

  static commandLastUsed(id, command){
    let connection = require('../Database').connection;
    return r
        .table('command_log')
        .pluck('timeUsed')
        .filter({id, command})
        .max('timeUsed')
        .default(null)
        .map(doc => { return {timeUsed: r.branch(doc('timeUsed').eq(null), 0, doc('timeUsed'))} })
        .run(connection)
        .then(cursor=>cursor.toArray()[0].timeUsed);
  }

}
