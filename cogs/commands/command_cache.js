const { readdir } = require('fs');
const { client } = require('../connections/discord');
const log = require('../../util/log/load');

exports.start = () =>
{
    readdir('./commands/', (err, files) =>
	{	if(err) return console.error(err);
		files.forEach(f =>
		{	readdir(`./commands/${f}`, (err, files) =>
			{	if(!files) return;
				if(err) return console.error(err);
				files.forEach(c =>
				{	const CommandClass = require(`../../commands/${f}/${c}`);
					let cmd = new CommandClass(client);
					client.commands.set(cmd.name, cmd);
					cmd.alias.forEach(alias =>
					{	client.aliases.set(alias, cmd.name);	});	});	});	});	});	}