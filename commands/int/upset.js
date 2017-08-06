const ram = require('../../util/embeds/ram');
const memberu = require('../../util/fetch/member');
const info = require('../../data/client/info');
const Command = require('../../cogs/commands/framework');

module.exports = class Upset extends Command {
  constructor() {
    super({
      alias: ['sad', 'cry'],
      name: 'upset',
      description: 'Show how upset you are... _pat_... Hope you\'re ok -Att. Wizardλ#5679',
      usage: 'cry <user>',
      example: ['cry @Wizardλ#4559', 'cry'],
      coins: 75,
      exp: 125,
      enabled: true
    });
  }

  async run(message, color, args) {
    const embed = await ram('cry', color, message);

    let nandayo;

    if(args[0]) {
      const member = await memberu(message, args);
      if (!member) return;

      if (member.user.id === message.author.id) {
        nandayo = `**${message.member.displayName}** is upset...`;
      } else if (info.devs.includes(member.user.id)) {
        nandayo = `**${message.member.displayName}** is upset with **${member.displayName}**...`;
        embed.setDescription(`_${member.user.username} what have you done..._`);
      } else if (member.user.id === this.client.user.id) {
        nandayo = `Why you are upset with me **${message.member.displayName}**...?`;
      } else {
        nandayo = `**${message.member.displayName}** is upset with **${member.displayName}**...`;
      }
    } else {
      nandayo = `**${message.member.displayName}** is upset...`;
    }

    await message.channel.send('<:ayy:315270615844126720> | ' + nandayo, {embed})
  }
}
