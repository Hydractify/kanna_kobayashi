const Command = require('../../cogs/commands/framework');
const urban = require('../../util/embeds/urban');

module.exports = class Urban extends Command 
{	constructor()
	{	super(
		{	name : 'urban',
			alias : ['urbandictionary', 'searchurban'],
			enabled : true	});	}
		
	async run(message, color, args)
	{	if(!args) return message.channel.send(`${message.author} you must provide a word!`);
		const embed = urban(args, color, message);
		await message.channel.send({embed});	}	}