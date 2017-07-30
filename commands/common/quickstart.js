const Command = require('../../cogs/commands/framework');
const common = require('../../util/embeds/common');

module.exports = class QuickStart extends Command {
  constructor() {
    super({
      alias: ['about'],
      name: 'quickstart',
      description: 'Quickstart on using my features!',
      coins: 0,
      exp: 0,
      enabled: true
    });
  }

  async run(message, color) {
    const embed = common(color, message)
    .setAuthor(`Welcome to my Quickstart ${message.author.username}`, message.author.displayAvatarURL)
    .setThumbnail(message.guild.iconURL)
    .setDescription(`${message.guild.owner} haves from the start permission level 2!`)
    .addField('Set-Up', `First of all, if you gaved me Admin permissions, remove it! It was only so i could send the first message!\nSecond, i work with permissions... Being...\n\n1⃣ **Level 0** | Everyone can do\n2⃣ **Level 1** | Dragon Tamer commands, needs a role assigned to yourself called \`Dragon Tamer\`.\n3⃣ **Level 2** | Human Tamer commands, you need either sufficient permission, or a role called \`Human Tamer\`.`)
    .addField('Disclaimers', `- If your guild haves more than 50 members and haves more bots than humans, Kanna will automatically ignore that guild, join the Official Guild to get whitelisted.\n- If your permission level is higher than the one you want, you don't need to fetch the requirements of that permission.`)
    .addField('Options', 'Basically with Kanna, you can change guild options, such as prefix and welcome messages, do `k!help options` for more info!')
    .addField('Official Guild', 'http://kannathebot.me/guild')
    .addField('Kanna Invite', 'http://kannathebot.me/invite')
    .addField('Patreon', 'http://kannathebot.me/patreon')
    .addField('Patreon Rewards', '💵 1$ | **Kanna Fanatic**\n- Donator Role on the Official Guild\n- Access to the Donator channel\n- Advertise your guild on donator-guilds channel\n\n💵 5$ | **Kanna Partner**\n- Previous rewards\n- I\'ll do a unique command for you only!\n\n💵 10$ | **Most Valuable Patron**\n- Previous Rewards\n- Yet to be discussed');

    await message.channel.send('Please, consider donating <:ayy:315270615844126720>', {embed});
  }
}
