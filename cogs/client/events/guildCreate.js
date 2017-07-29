const Discord = require('discord.js');
const color = require('../../../util/client/embed_color');

const sanitizeQuotes = input => input.replace(/'/g,"\\'");

module.exports = async (client, guild) =>
{	await guild.defaultChannel.send(`Thanks for adding me on **${guild.name}**! If you want to see a quick start just type \`k!quickstart\`! If you have any problems with the bot join the official guild and ask for help! http://kannathebot.me/guild`);
	const Guild = await guild.fetchMembers();
	const shardGuilds = await client.shard.fetchClientValues('guilds.size');
	const totalGuilds = shardGuilds.reduce((p, n) => p + n , 0 );
	client.shard.broadcastEval(`if (this.channels.has('303180857030606849'))
	this.channels.get('303180857030606849').send({embed: new (require('discord.js').RichEmbed)()
	.setThumbnail('${guild.iconURL}')
	.setTitle('I have joined a Guild!')
	.setDescription('Kanna is now on ${totalGuilds} guilds')
	.setColor('${color()}')
	.addField('Guild Name', '${sanitizeQuotes(guild.name)}', true)
	.addField('Guild ID', '${guild.id}', true)
	.addField('Owner', '${sanitizeQuotes(guild.owner.user.tag)}', true)
	.addField('Owner ID', '${guild.owner.user.id}', true)
	.addField('Total Members', ${Guild.memberCount}, true)
	.addField('Humans', ${Guild.members.filter(m => !m.user.bot).size}, true)
	.addField('Bots', ${Guild.members.filter(m => m.user.bot).size}, true)
	.setThumbnail('${guild.iconURL}')});`);}
