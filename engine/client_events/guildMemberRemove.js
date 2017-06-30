module.exports = async (client, member) => {
  if(member.guild.id !== '298969150133370880') return;
  gChannel = client.guilds.get('298969150133370880').channels.get('318455085409763328');
  await gChannel.send(`**${member.user.username}** has left our cult!`);
}
