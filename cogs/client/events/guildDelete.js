const color = require('../../../util/client/embed_color');
const sanitizeQuotes = require('../../../util/sanitizeQuotes');
const blackFile = require('../../../data/client/blacklist');

module.exports = async (client, guild) => {
	const Guild = await guild.fetchMembers();
	const shardGuilds = await client.shard.fetchClientValues('guilds.size');
	const totalGuilds = shardGuilds.reduce((p, n) => p + n , 0 );
	const blacklisted = blackFile.includes(guild.owner.user.id) ? 'Yes' : 'No';
	client.shard.broadcastEval(`if (this.channels.has('303180857030606849'))
	this.channels.get('303180857030606849').send({embed: new (require('discord.js').RichEmbed)()
	.setThumbnail('${guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png'}')
	.setTitle('I have left a Guild!')
	.setDescription('Kanna is now on ${totalGuilds} guilds')
	.setColor('${color()}')
	.addField('Guild Name', '${sanitizeQuotes(guild.name)}', true)
	.addField('Guild ID', '${guild.id}', true)
	.addField('Owner', '${sanitizeQuotes(guild.owner.user.tag)}', true)
	.addField('Owner ID', '${guild.owner.user.id}', true)
	.addField('Blacklisted', '${blacklisted}',true)
	.addField('Total Members', ${Guild.memberCount}, true)
	.addField('Humans', ${Guild.members.filter(m => !m.user.bot).size}, true)
	.addField('Bots', ${Guild.members.filter(m => m.user.bot).size}, true)
	.setThumbnail('${guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png' || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png'}')});`);
}
