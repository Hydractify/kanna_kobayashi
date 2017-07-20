const event = (event) => {	return require(`./events/${event}`);	};
const { readdir } = require('fs');
const log = require('../../util/log/load');
const { client } = require('../connections/discord');

exports.start = () =>
{	readdir('./cogs/client/events/', (err, files) =>
	{	if(err) return console.error(err);
		files.forEach(f =>
		{	const eName = f.replace('.js', '');
			client.on(eName, (...args) => event(eName)(client, ...args)
			.catch(err => console.log(`Unexpected error at event ${eName}\n${err.stack}`)));	});	
		log(`Loaded ${files.length} Client Events`);	});	}