const Database = require('../Database').connection

module.exports = class User {
  static constructor(r, connection, id)
  {
    if(!r instanceof require('rethinkdb')) throw new Error('The first parameter needs to be an instanceof rethinkdb module!');
    if(!connection instanceof Database) throw new Error('The second parameter isn\'t an instanceof a connection!');
    if(typeof id !== 'string') throw new Error('ID must be a string!');
  }

  static get stats()
  {
    r.db('users').table('stats').filter(r.row('id').eq(id)).run(connection, function(err, cursor)
    {
      if(err) throw err;
      cursor.toArray(async function(err, result)
      {
        const { user } = require('../../util/get');
        const stats = result;
      })
    })
    .then(() =>
    {
      return result;
    })
  }
}
