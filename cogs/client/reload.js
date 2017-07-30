const log = require('../../util/log/load');
const log1 = require('../../util/log/error');

exports.start = () => {
	const { client } = require('../connections/discord');
	client.reload = command => {
		return new Promise((resolve, reject) => {
			try {
				delete require.cache[require.resolve(`../../commands/${command.category}/${command.name}`)];
				client.aliases.forEach((cmd, alias) => {
					if (cmd === command.name) client.aliases.delete(alias);
				});
				let CommandClass = require(`../../commands/${command.category}/${command.name}`);
				let cmd = new CommandClass(client);
				cmd.category = command.category;
				client.commands.set(cmd.name, cmd);
				cmd.alias.forEach(alias => {
					client.aliases.set(alias, cmd.name);
				});
				log(`Sucessfully reloaded ${command.name}`);
				resolve();
			} catch(e) {
				log1(`Failed to reload ${command.name}`, e);
					reject();}
				});
			}
		}
