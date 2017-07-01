const r = require('rethinkdb');

const { db } = require('../util/log.js');

module.exports = class Database {
  static async start() {
    const connection = await r.connect({
      db: 'users',
    });
    db('Sucessfully connected to RethinkDB');
    Database._connection = connection;
  }

  static get connection() {
    if (!Database._connection) {
      throw new Error('Connection is not yet ready!');
    }
    return Database._connection;
  }
}
