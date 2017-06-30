const Discord = require('discord.js');

module.exports = async (client, guild) => {

  await guild.defaultChannel.send(`Thanks for adding me on **${guild.name}**! If you want to see a quick start just type \`k!quickstart\`! If you have any problems with the bot join the official guild and ask for help! http://kannathebot.me/guild`);

      let members = await guild.fetchMembers();

      const pinku = require('color-convert').hsv.hex(Math.random()*(350 - 250)+280, Math.random()*(100 - 50)+50, Math.random()*(100 - 50)+50);

      const embed = new Discord.RichEmbed()
      .setThumbnail(fuccMe)
      .setTitle('I have joined a guild!')
      .setDescription(`Kanna is now on ${client.guilds.size} guilds`)
      .addField('Guild Name', guild.name)
      .addField('Guild ID', `${guild.id}`, true)
      .addField('Owner', `${guild.owner.user.tag}`, true)
      .addField('Owner ID', guild.ownerID)
      .addField('Total Members', `${guild.memberCount}`, true)
      .addField('Humans', `${members.filter(g => !g.user.bot).size}`, true)
      .setColor(pinku)
      .addField('Bots', `${members.filter(g => g.user.bot).size}`, true);
      if(guild.iconURL) {
         embed.setThumbnail(guild.iconURL);
       }
      await client.guilds.get('298969150133370880').channels.get('303180857030606849').send({embed});
};
