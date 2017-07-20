const { readdir } = require('fs');
const { client } = require('../connections/discord');
const log = require('../../util/log/load');
const Discord = require('discord.js');

exports.start = () =>
{	client.commands = new Discord.Collection();
	client.aliases = new Discord.Collection();
	readdir('./commands/', (err, files) =>
	{	if(err) return console.error(err);
		files.forEach(f =>
		{	readdir(`./commands/${f}`, (error, filez) =>
			{	if(!filez) return;
				if(error) return console.error(error);
				filez.forEach(c =>
				{	const CommandClass = require(`../../commands/${f}/${c}`);
					let cmd = new CommandClass();
					client.commands.set(cmd.name, cmd);
					cmd.alias.forEach(alias =>
					{	client.aliases.set(alias, cmd.name);	});	});	
				log(`Loaded ${filez.length} ${f} commands`);	});	});	});	}