const { Guild } = require('../../../data/Models');

module.exports = async(client, member) => {
    if(!member.guild.me) return;
    if (!member.guild.me.permissionsIn(member.guild.defaultChannel).has('SEND_MESSAGES')) return;
    let guild;
    try {
        guild = await Guild.get(member.guild.id).run();
    } catch (err) {
        guild = new Guild({ id: member.guild.id });
        guild.save();
    }
    if (!guild.notifications.welcome) return;
    await member.guild.defaultChannel.send(`Sad to see you depart **${member.user.tag}**... <:ayy:315270615844126720>`);
};

module.exports = async (client, member) =>
{	await member.guild.defaultChannel.send(`Sad to see you depart **${member.user.tag}**... <:ayy:315270615844126720>`);	}