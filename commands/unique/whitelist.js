const Discord = require('discord.js');
const Command = require('../../cogs/commands/framework');
const fs = require('fs');
const log = require('../../util/log/error');
const whiteFile = require('../../data/client/whitelist');
const fetchM = require('../../util/fetch/member');
const fetchU = require('../../util/fetch/user');
const cases = require('../../data/client/cases');
const info = require('../../data/client/info');

module.exports = class Whitelist extends Command
{ constructor()
  { super(
    { name: 'whitelist',
      permLevel: 3,
      alias: ['pardon'],
      usage: 'whitelist <user>',
      example: ['whitelist Wizard'],
	  enabled: true	});	}	
	
	async run(message, color, args)
	{	let file = JSON.parse(fs.readFileSync('./data/client/whitelist.json', 'utf8'));
		if (!args[0]) return message.channel.send(`Hey ${message.author}... Do it right! It's \`${this.usage}\``);

		const member = await fetchM(message, args);
		const user = await fetchU(message, args);
		
		if (user.id === message.author.id) return message.channel.send(`You can't whitelist yourself ${message.author}!`);
		if (info.trusted.includes(user.id) || info.devs.includes(user.id)) return message.channel.send(`**${user.tag}** cannot be whitelisted!`);
		if (whiteFile.includes(user.id)) return message.channel.send(`**${user.tag}** is already whitelisted!`);

		await message.channel.send(`Are you sure you want to whitelist **${user.tag}**?`);
		let collected = await message.channel.awaitMessages(response => response.author === message.author && (response.content.toLowerCase() === 'yes' || response.content.toLowerCase() === 'no'), { max: 1 });
		
		if (collected.first().content.toLowerCase() === 'yes')
		{	await file.push(user.id)
			await fs.writeFile('./data/client/whitelist.json', JSON.stringify(file), 'utf8', (err) =>
			{	if (err) log(err.stack);	});
			await message.channel.send(`Sucessfully whitelisted **${user.tag}**`);
			let cases = JSON.parse(fs.readFileSync('./data/client/cases.json', 'utf8'));
			cases.whitelist++;
			await fs.writeFile('./data/client/cases.json', JSON.stringify(cases), 'utf8', (err) =>
			{	if (err) log(err.stack);	}); 
			const embed = new Discord.RichEmbed()
			.setColor(color)
			.setTimestamp()
			.setAuthor(`Whitelisted by ${message.author.tag}`, message.author.displayAvatarURL)
			.setDescription('\u200b')
			.setThumbnail(user.displayAvatarURL)
			.addField('Name', user.tag, true)
			.addField('ID', user.id, true)
			.addField('Owns', this.client.guilds.filter(g => g.owner === member).size || '0' + ' guilds', true)
			.addField('Case Number', cases.whitelist, true)
			await this.client.guilds.get('298969150133370880').channels.get('302286657271496705').send({embed});	}
		
		if (collected.first().content.toLowerCase().includes('no')) return message.channel.send(`Canceling the whitelist...`);	}	}	