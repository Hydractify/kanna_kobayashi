const Command = require('../../cogs/commands/framework');
const common = require('../../util/embeds/common');

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
    .setAuthor(`${this.client.user.username} Info`, this.client.user.displayAvatarURL)
    .setDescription('\u200b')
    .addField('Invite', 'http://kannathebot.me/invite', true)
    .addField('Patreon', 'http://kannathebot.me/patreon', true)
    .addField('Official Guild', 'http://kannathebot.me/guild', true)
    .addField('Official Website', 'http://kannathebot.me', true)
    .setThumbnail(this.client.user.displayAvatarURL);

    await message.channel.send({embed});	}	}