const table = require('../engine/db/tables');
const Database = require('../engine/Database');
module.exports = class User {

	static modify(user, options) {
    if(typeof options !== 'object') throw new Error('Options must be a valid object!');

		table.update('stats', options, user.id);
	}

	 static async stats(user){
		let results = await table.stats('stats', user.id);
		let stats = table.userStat(results, 'stats');
		return stats;
	}

}
