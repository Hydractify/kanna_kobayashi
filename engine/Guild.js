const table = require('../engine/db/tables');
module.exports = class Guild {

	static modify(option , argument , guild) {
		table.update('guilds' , {option : argument} , guild.id);
	}

	 static async stats(guild){
		let results = await table.stats('guilds' , guild.id);
		let stats = table.guildStat(results , "guilds");
		return stats;
	}
}
