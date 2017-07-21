const Command = require('../../cogs/commands/framework');
const common = require('../../util/embeds/common');
const { client } = require('../../cogs/connections/discord');

module.exports = class Info extends Command
{ constructor()
  { super(
    { name: 'info',
      description: 'All the useful links you need!',
      alias: ['invite', 'patreon', 'guild', 'ghearts'],
      enabled: true	});	}

  async run(message, color)
  { const embed = common(color, message);

    embed
    .setAuthor(`${client.user.username} Info`, client.user.displayAvatarURL)
    .setDescription('\u200b')
    .addField('Invite', 'http://kannathebot.me/invite', true)
    .addField('Patreon', 'http://kannathebot.me/patreon', true)
    .addField('Official Guild', 'http://kannathebot.me/guild', true)
    .addField('Official Website', 'http://kannathebot.me', true)
    .setThumbnail(client.user.displayAvatarURL);

    await message.channel.send({embed});	}	}
