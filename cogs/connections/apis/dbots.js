const superagent = require('superagent');
const { dbots } = require('../../../data/auth/keys');
const log = require('../../../util/log/bot');
const { client } = require('../discord');
const log1 = require('../../../util/log/error');

exports.start = async () =>
{	const clientValues = await client.shard.fetchClientValues('guilds.size');
	const totalGuilds = clientValues.reduce((prev, val) => prev + val, 0);
	setTimeout( () =>
	{
		log('Posting server_count to Discord Bot List');
		superagent
		.post(`https://bots.discord.pw/api/bots/${client.user.id}/stats`)
		.set('Authorization', dbots)
		.send({	server_count : totalGuilds	})
		.then( () =>
		{	log('Sucessfully posted server_count to Discord Bot List');	})
		.catch(e => log1(e.stack, e));	}, 1800000);	}
