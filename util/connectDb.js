const r = require('rethinkdb');

var con = null;

module.exports = class Database {
  static start() {
    r.connect({
      db: 'users',
    }, (err, conn) => {
     if (err) throw err;
     if(conn) require('./log.js').db(`Sucessfully connected to RethinkDB`);
     con = conn;
   })
  }

  static get connection () {
    return con;
  }
}
