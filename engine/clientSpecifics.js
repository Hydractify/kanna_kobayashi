const Discord = require('discord.js');
const settings = require('../util/settings.json');
const { load } = require('../util/log.js');

module.exports = client => {
  client.commands = new Discord.Collection();
  client.aliases = new Discord.Collection();

  client.reload = command => {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(`../commands/${command}`)];
        let cmdFile = require(`../commands/${command}`);
        let cmd = new cmdFile(client);
        client.commands.delete(command);
        client.aliases.forEach((cmd, alias) => {
          if (cmd === command) client.aliases.delete(alias);
        });
        client.commands.set(command, cmd);
        cmd.alias.forEach(alias => {
          client.aliases.set(alias, cmd.name);
        });
        load(`Sucessfully reloaded ${command}`);
        resolve();
      } catch (e){
        log.load(`Failed to reload ${command}`)
        reject(e);
      }
    })
  };

  client.userPerms = message => {
      if (settings.client.owner.includes(message.author.id)) return 4;

      const member = client.guilds.get('298969150133370880').members.has(message.author.id);
      if (member && (message.member.roles.has('299655329791213569')
          || message.member.highestRole.position > 17)
      ) return 3;

      if (message.member.permissions.has('MANAGE_GUILD')
          || message.member.permissions.has(['BAN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_MESSAGES'])
      ) return 2;

      const dragonTamer = message.guild.roles.find(role => role.name.toLowerCase() === 'dragon tamer');
      if (dragonTamer && message.member.roles.has(dragonTamer.id)) return 1;

      return 0;
  };
  load('Loaded Client Specifics');
}
