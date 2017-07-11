const Command = require('../engine/commandClass');
const embeds = require('../util/embeds');

module.exports = class Info extends Command
{
  constructor(client)
  {
    super(client,
    {
      name: 'info',
      description: 'All the useful links you need!',
      alias: ['invite', 'patreon', 'guild', 'ghearts'],
      enabled: true
    });
  }

  async run(client, message, color)
  {
    const embed = embeds.common(color, message);

    embed
    .setAuthor(`${client.user.username} Info`, client.user.displayAvatarURL)
    .setDescription('\u200b')
    .addField('Invite', 'http://kannathebot.me/invite', true)
    .addField('Patreon', 'http://kannathebot.me/patreon', true)
    .addField('Official Guild', 'http://kannathebot.me/guild', true)
    .addField('Official Website', 'http://kannathebot.me', true)
    .setThumbnail(client.user.displayAvatarURL);

    await message.channel.send({embed});
  }
}
