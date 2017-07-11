const table = require('../engine/db/tables');

module.exports = class Guild {

	static async modify(guild, options) {
		if(typeof options !== 'object') throw new Error('Options must be an object!');

		let cnt = await require('rethinkdb').table('guilds').filter({id : guild.id}).count().run(require('./Database').connection);

		if(cnt === 0)
		{
			table.insert('guilds',
			{
				id: guild.id,
				prefix: ["kanna pls ", "<@!?299284740127588353> ", 'k!'],
				levelUpMessages: true,
				modrole: 'Human Tamer',
				welcomeMessages: false,
				quizrole: 'Dragon Tamer',
				quizPhoto: 'http://pm1.narvii.com/6366/2c35594538206f7f598be792bf203b6b638e9c07_hq.jpg',
				firstName: 'Kanna',
				lastName: 'Kobayashi'
			});
			await table.update('guilds', options, guild.id);
		}
		else
		{
			table.update('guilds', options, guild.id);
		}
	}
	 static async stats(guild)
	 {
	  let cnt = await require('rethinkdb').table('guilds').filter({id : guild.id}).count().run(require('./Database').connection);

		if(cnt === 0)
		{
			await table.insert('guilds',
			{
				id: guild.id,
				prefix: ["kanna pls ", "<@!?299284740127588353> ", 'k!'],
				levelUpMessages: true,
				modrole: 'Human Tamer',
				welcomeMessages: false,
				quizrole: 'Dragon Tamer',
				quizPhoto: 'http://pm1.narvii.com/6366/2c35594538206f7f598be792bf203b6b638e9c07_hq.jpg',
				firstName: 'Kanna',
				lastName: 'Kobayashi'
			});
			let results = await table.stats('guilds', guild.id);
			let stats = table.guildStat(results, "guilds");
			return stats;
		}
		else
		{
			let results = await table.stats('guilds', guild.id);
			let stats = table.guildStat(results, "guilds");
			return stats;
		}
	}
}
