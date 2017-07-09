const Discord = require('discord.js');
const table = require('../engine/db/tables');

module.exports = async (client, guild) => {

  await guild.defaultChannel.send(`Thanks for adding me on **${guild.name}**! If you want to see a quick start just type \`k!quickstart\`! If you have any problems with the bot join the official guild and ask for help! http://kannathebot.me/guild`);

      let guildFetch = await guild.fetchMembers();

      await table.insert('guilds',
      {
        id: guild.id,
        prefix: ["kanna pls ", "<@!?299284740127588353> ", 'k!'],
        levelUpMessages: true,
        modrole: 'Human Tamer',
        welcomeMessages: false,
        quizrole: 'Dragon Tamer'
      });


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
      .addField('Humans', `${guildFetch.members.filter(g => !g.user.bot).size}`, true)
      .setColor(pinku)
      .addField('Bots', `${guildFetch.members.filter(g => g.user.bot).size}`, true);
      if(guild.iconURL) {
         embed.setThumbnail(guild.iconURL);
       }
      await client.guilds.get('298969150133370880').channels.get('303180857030606849').send({embed});
};
