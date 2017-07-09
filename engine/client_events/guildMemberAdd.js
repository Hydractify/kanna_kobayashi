const Guild = require('../Guild');

module.exports = async (client, member) => {
  if(!Guid.stats(member.guild).welcomeMessages) return;
  gChannel = member.guild.defaultChannel;
  await gChannel.send(`Welcome to **${member.guild.name}** ${member.user.toString()}! <:hugme:299288600556601344>`);
}
