const Discord = require('discord.js');

module.exports = async (client, guild) => {

  let members = await guild.fetchMembers();

  const pinku = require('color-convert').hsv.hex(Math.random()*(350 - 250)+280, Math.random()*(100 - 50)+50, Math.random()*(100 - 50)+50)

     const embed = new Discord.RichEmbed()
     .setTitle('I have left a guild!')
     .setDescription(`Kanna is now on ${client.guilds.size} guilds`)
     .addField('Guild Name', guild.name)
     .addField('Guild ID', `${guild.id}`, true)
     .addField('Owner', `${guild.owner.user.tag}`, true)
     .addField('Owner ID', guild.ownerID)
     .addField('Total Members', `${guild.members.size}`, true)
     .addField('Humans', `${members.filter(g => !g.user.bot).size}`, true)
     .addField('Bots', `${members.filter(g => g.user.bot).size}`, true)
     .setColor(pinku);
     if(guild.iconURL) {
       embed.setThumbnail(guild.iconURL);
     }
     await client.guilds.get('298969150133370880').channels.get('303180857030606849').send({embed});
};
