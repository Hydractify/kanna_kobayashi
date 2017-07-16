const event = (event) => {	require('./events/${event}');	};
const { readdir } = require('fs');
const log = require('../../util/log/load');
const { client } = require('../connections/discord');

exports.start = () =>
{	readdir('./cogs/client/events/', (err, files) =>
	{	if(err) console.error(err);
		log(`Loading ${files.length} Client Events`);
		files.forEach(f =>
		{	client.on(f, (...args) => event(f)(client, ...args));	});	});	}