module.exports = class Perm
{
  static check(client, member, message)
  {
    if(typeof member !== 'object') throw new Error('GuildMember must be an object!');
    if(typeof message !== 'object') throw new Error('Message must be an object!');

    if (member.permissions.has('MANAGE_GUILD')
        || member.permissions.has(['BAN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_MESSAGES'])
    ) return 2;

    const dragonTamer = message.guild.roles.find(role => role.name.toLowerCase() === 'dragon tamer');
    if (dragonTamer && message.member.roles.has(dragonTamer.id)) return 1;

    return 0;
  }
}
