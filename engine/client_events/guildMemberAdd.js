module.exports = async (client, member) => {
  if(member.guild.id !== '298969150133370880') return;
  gChannel = client.channels.get('318455085409763328');
  await gChannel.send(`Welcome to **${member.guild.name}** ${member.user.toString()}! Read ${member.guild.channels.get('299750830519615491').toString()} for having knowledge of the rules, and get some special things!`);
}
