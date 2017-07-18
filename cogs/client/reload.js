const log = require('../../util/log/load');
const log1 = require('../../util/log/error');

exports.start = () =>
{	const { client } = require('../connections/discord');
	client.reload = command =>
	{	return new Promise((resolve, reject) =>
		{	try
			{	delete require.cache[require.resolve(`../../commands/${command}`)];
				client.commands.delete(command);
				client.aliases.forEach((cmd, alias) =>
				{	if (cmd === command) client.aliases.delete(alias);	});
				let CommandClass = require(`../../commands/${command}`);
				let cmd = new CommandClass(client);
				client.commands.set(cmd.name, cmd);
				cmd.alias.forEach(alias =>
				{	client.aliases.set(alias, cmd.name);	});
				log(`Sucessfully reloaded ${command}`);
				resolve();
				}
				catch(e)
				{	log1(`Failed to reload ${command}`);
					reject();}	});	}	}
