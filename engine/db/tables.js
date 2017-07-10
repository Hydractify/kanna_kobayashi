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
    let welcomeMessages = result.welcomeMessages ? 'Enabled' : 'Disabled';
    let eventRole = result.eventRole;
    let firstName = result.firstName;
    let lastName = result.lastName;
    let quizPhoto = result.quizPhoto;

    return {
      id,
      prefix,
      levelUpMessages,
      modrole,
      welcomeMessages,
      eventRole,
      firstName,
      lastName,
      quizPhoto
    }
  }

  static async logCommand(userID, command)
   {
     let connection = require('../Database').connection;
     let cnt = await r.table('command_log').filter({userID, command}).count().run(connection);

     if(cnt === 0)
     {
       return r
         .table('command_log')
         .insert({userID, command, timeUsed: Date.now()})
         .run(connection);
     }
     return r
       .table('command_log')
       .filter({userID, command})
       .update({timeUsed: Date.now()})
       .run(connection);
    }

   static commandLastUsed(userID, command)
   {
     let connection = require('../Database').connection;
     return r
       .table('command_log')
       .filter({userID, command})
       .max('timeUsed')('timeUsed')
       .default(0)
       .run(connection);
   }
 }
