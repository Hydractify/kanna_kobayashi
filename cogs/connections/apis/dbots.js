const superagent = require('superagent');
const { dbots } = require('../../../data/auth/keys');
const log = require('../../../util/log/bot');
const client = require('../discord').Client;
const log1 = require('../../../data/log/error');

exports.start = async () =>
{	setTimeout( () =>
	{	log('Posting server_count to Discord Bot List');
		superagent
		.post(`https://bots.discord.pw/api/bots/${client.user.id}/stats`)
		.set('Authorization', fakedbots)
		.send({	server_count : totalGuilds	})
		.then( () =>
		{	log('Sucessfully posted server_count to Discord Bot List');	})
		.catch( (err) =>
		{	log1(err);	});	}, 1800000);	}