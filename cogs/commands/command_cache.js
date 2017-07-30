const { readdir } = require('fs');
const { client } = require('../connections/discord');
const log = require('../../util/log/load');
const Discord = require('discord.js');
const log1 = require('../../util/log/error');

exports.start = () => {
	client.commands = new Discord.Collection();
	client.aliases = new Discord.Collection();
	readdir('./commands/', (err, files) => {
		if (err) return log1(err.stack, err)
		files.forEach(f => {
			readdir(`./commands/${f}`, (error, filez) => {
				if(!filez) return;
				if(error) return log1(error.stack, error);
				filez.forEach(c => {
					const CommandClass = require(`../../commands/${f}/${c}`);
					let cmd = new CommandClass();
					cmd.category = f;
					client.commands.set(cmd.name, cmd);
					cmd.alias.forEach(alias => {
						client.aliases.set(alias, cmd.name);
					});
				});
				log(`Loaded ${filez.length} ${f} commands`);
			});
		});
	});
}
