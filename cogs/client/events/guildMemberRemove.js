module.exports = async(client, member) => {
    if (!member.guild.defaultChannel.permissionsFor(member.guild.me).has('SEND_MESSAGES')) return;
    let guild;
    try {
        guild = await Guild.get(member.guild.id).run();
    } catch (err) {
        guild = new Guild({ id: member.guild.id });
        guild.save();
    }
    if (!guild.notifications.welcome) return;
    await member.guild.defaultChannel.send(`Sad to see you depart **${member.user.tag}**... <:ayy:315270615844126720>`);
}
