const log = require('../../util/log/load');
const log1 = require('../../util/log/error');

exports.start = () =>
{	const { client } = require('../connections/discord');
	client.reload = command =>
	{	return new Promise((resolve, reject) =>
		{	try
			{	delete require.cache[require.resolve(`../../commands/${command}`)];
				let files = require(`../../commands/${command}`);
				client.commands.delete(command);
				client.aliases.forEach((cmd, alias) =>
				{	if (cmd === command) client.aliases.delete(alias);	});
				client.commands.set(command, /*To be set*/);
				/*To be set*/toBeSet.alias.forEach(alias =>
				{	client.aliases.set(alias, /*To be set*/);	});
				log(`Sucessfully reloaded ${command}`);
				resolve();
				}
				catch(e)
				{	log1(`Failed to re-load ${command}`);
					reject}	});	}	}