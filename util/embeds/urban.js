const api = require('../../cogs/connections/apis/urban');
const Discord = require('discord.js');

module.exports = async (args, color, message) =>
{	if (typeof color !== 'string') throw new Error();
	if (!message instanceof Discord.Message) throw new Error('Message isn\'t an instanceof Discord.Message');
	let urban = await api(args.join('+').toLowerCase()	);
	const text = JSON.parse(urban.text);
	const list = text.list[0];
	console.log(list);
	return new Discord.RichEmbed()
	.setFooter(`Requested by ${message.author.tag} | Powered by urbandictionary`)
	.setAuthor(`${list.word} Definition`, message.author.displayAvatarURL)
	.setDescription('\u200b')
	.setThumbnail(message.guild.iconURL)
	.setColor(color)
	.setURL(list.permalink)
	.addField('Author', list.author)
	.addField('Definition', list.definition)
	.addField('Example', list.example)
	.addField('Thumbs Up 👍', list.thumbs_up, true)
	.addField('Thumbs Down 👎', list.thumbs_down, true);	}