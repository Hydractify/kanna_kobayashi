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
    .setThumbnail(message.guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png')
    .setDescription(`${message.guild.owner} haves from the start permission level 2!`)
    .addField('Set-Up', `First of all, if you gave me Admin permissions, remove it! It was only so i could send the first message!\nSecond, i work with permissions... Being...\n\n1⃣ **Level 0** | Everyone can do\n2⃣ **Level 1** | Dragon Tamer commands, needs a role assigned to yourself called \`Dragon Tamer\`.\n3⃣ **Level 2** | Human Tamer commands, for it you need Kick Members and Ban Members permission.`)
    .addField('Disclaimers', `- If your guild haves more than 50 members and haves more bots than humans, Kanna will automatically ignore that guild, join the Official Guild to get whitelisted.\n- If your permission level is higher than the one you want, you don't need to fetch the requirements of that permission.`)
    .addField('Options', 'Basically with Kanna, you can change guild options, such as prefix and welcome messages, do `k!help options` for more info!')
    .addField('Official Guild', 'http://kannathebot.me/guild')
    .addField('Kanna Invite', 'http://kannathebot.me/invite')
    .addField('Patreon', 'http://kannathebot.me/patreon')

    await message.channel.send('Please, consider donating <:ayy:315270615844126720>', {embed});
  }
}
