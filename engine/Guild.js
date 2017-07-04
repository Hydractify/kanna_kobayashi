const table = require('../engine/db/tables');

module.exports = class Guild {

	static modify(guild, options) {
		if(typeof options !== 'object') throw new Error('Options must be an object!');

		table.update('guilds', options, guild.id);
	}

	 static async stats(guild)
	 {
		let results = await table.stats('guilds', guild.id);
		let stats = table.guildStat(results, "guilds");
		return stats;
	}
}
