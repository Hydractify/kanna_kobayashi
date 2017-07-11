const table = require('../engine/db/tables');
const Database = require('../engine/Database');
module.exports = class User {

	static async modify(user, options) {
    if(typeof options !== 'object') throw new Error('Options must be a valid object!');

		let cnt = await require('rethinkdb').table('guilds').filter({id : guild.id}).count().run(require('./Database').connection);
		if(cnt === 0)
		{
			await table.insert('stats',
			{
				id: user.id,
				level: 1,
				exp: 0,
				coins: 100,
				items: [],
				badges: [],
				baseExp: 100
			});
			await table.update('stats', options, user.id);
		}
		else
		{
			table.update('stats', options, user.id);
		}
	}

	 static async stats(user){
		let results = await table.stats('stats', user.id);
		let stats = table.userStat(results, 'stats');
		return stats;
	}

}
