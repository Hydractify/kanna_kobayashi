module.exports = async (client, member) =>
{	await member.guild.defaultChannel.send(`Welcome to **${member.guild.name}** ${member.user.toString()}! <:hugme:299288600556601344>`);	}