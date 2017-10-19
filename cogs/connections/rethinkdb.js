const r = require('rethinkdb');
const log = require('../../util/log/database');

module.exports = class RethinkDb 
{	static async start()
	{	const connection = await r.connect(
		{	db: 'users'	}	);
		log('Connected to RethinkDB');
		RethinkDb._connection = connection;	}
	
	static get connection()
	{	if (!RethinkDb._connection)
		{	throw new Error('Connection to RethinkDB is not ready yet!');	}
		return RethinkDb._connection;	}	}
