const Guild = require('../Guild');

module.exports = async (client, member) => {
  if(!Guild.stats(member.guild).welcomeMessages) return;
  gChannel = member.guild.defaultChannel;
  await gChannel.send(`Sad to see you depart **${member.user.tag}**... <:ayy:315270615844126720>`);
}
