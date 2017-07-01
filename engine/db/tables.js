const r = require('rethinkdb');

module.exports = class User
{

  static stats(connection, table, id)
  {
    if(typeof id !== 'string') throw new Error('ID must be a string!');
    if(typeof table !== 'string') throw new Error('Table name must be a string!');

    return r
      .db('users')
      .table(table)
      .filter(r.row('id').eq(id))
      .run(connection)
      .then(cursor => cursor.toArray());
  }

  static insert(connection, table, options)
  {
    if(typeof options !== 'object') throw new Error('You must insert a valid object!');
    if(typeof table !== 'string') throw new Error('Table name must be a string!');

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

    let idR = result.id;
    let levelR = result.level;
    let expR = result.exp;
    let coinsR = result.coins;
    let itemsR = result.items.join(', ');
    let badgesR = result.badges.join(', ');
    let baseExpR = result.baseExp;
    if(result.badges.length < 1) badgesR = 'None';
    if(result.items.length < 1) itemsR = 'None';

    return {
      id: idR,
      level: levelR,
      exp: expR,
      coins: coinsR,
      items: itemsR,
      badges: badgesR,
      baseExp: baseExpR
    }

  }

  static update(connection, table, options)
  {
    if(typeof options !== 'object') throw new Error('You must insert a valid object!');
    if(typeof table !== 'string') throw new Error('Table name must be a string!');

    return r
    .db('users')
    .table(table)
    .update(options)
    .run(connection);
  }

  static guildStat(results, table)
  {
    
  }
}
