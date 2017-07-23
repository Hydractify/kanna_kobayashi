const Command = require('../../cogs/commands/framework');
const sendErr = require('../../util/client/error/stack');
const { client } = require('../../cogs/connections/discord');

module.exports = class Reload extends Command 
{ constructor()
  { super(
 	{ alias: ['r'],
      permLevel: 4,
      name: 'reload',
      description: 'Reloads the command file, if it\'s been updated or modified.',
      usage: 'reload <commandname>',
      exp: 0,
      coins: 0,
	  enabled: true	});	}
	  
  async run(message, pink, args) 
  {	try
	{ let command;
	  if (client.commands.has(args[0])) 
	  {	command = args[0];	} 
	else if (client.aliases.has(args[0])) 
	{	command = client.aliases.get(args[0]);	}
	if (!command) 
	{	return await message.channel.send(`I cannot find the command: ${args[0]}`);	}
	else 
	{	message.channel.send(`Reloading: ${command}`)
		.then(async m => 
		{	await client.reload(command)
			.then(async () => 
			{	await m.edit(`Successfully reloaded: ${command}`);	})
			.catch(async e => 
			{	await m.edit(`Command reload failed: ${command}\n\`\`\`${e}\`\`\``);	});	});	}	}
	catch(err)
	{	await message.channel.send(sendErr(err, message, this));	}	}	}