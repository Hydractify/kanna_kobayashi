const { readdir } = require('fs');
const { client } = require('../connections/discord');
const log = require('../../util/log/load');

exports.start = () =>
{	readdir('./commands/'), (err, files) =>
	{	if(err) console.error(err);
		files.forEach(f =>
		readdir(`./commands/${f}/`, (err, files) =>
		{	if(err) console.error(err);
			f.forEach(c =>
			{	let commandFile = require(`../commands/${f}/${c}`);
				//Here is where we define the command
				client.commands.set(cmd.name, cmd);
				cmd.alias.forEach(alias =>
				{	client.aliases.set(alias, cmd.name);	});	});	}));	}	}