const meme = require('../../util/embeds/meme');
const Command = require('../../cogs/commands/framework');
const memberu = require('../../util/fetch/member');

module.exports = class Kiss extends Command {
  constructor() {
    super({
      alias: ['MASSAGE'],
      name: 'massage',
      description: 'Give someone a massage',
      usage: 'massage <user>',
      example: ['massage @Wizardλ#4559'],
      coins: 75,
      exp: 125,
      enabled: true
    });
  }

  async run(message, color, args) {
    const embed = await meme(require('../../data/links').memes.massage, color, message);

    let nandayo;

    if(args[0]) {
      const member = await memberu(message, args);

      if(!member) return;

      if (member.user.id === message.author.id) {
        return message.channel.send(`${message.author} you can't give yourself a masssage!`);
      } else if(require('../../data/client/info').devs.includes(member.user.id)) {
        nandayo = `**${message.member.displayName}** gave **${member.displayName}** a massage!`;
        embed.setDescription(`\:eyes:`);
      } else if(member.user.id === this.client.user.id) {
        nandayo = `I'll give you a massage **${message.member.displayName}**! <:ayy:315270615844126720>`;
        return message.channel.send(nandayo, {embed})
      } else {
        nandayo = `**${message.member.displayName}** gave **${member.displayName}** a massage!`;
      }
    } else {
      nandayo = `I'll give Kobayashi-san a massage!`;
    }

    await message.channel.send('<:hmm:315264556282675200> | ' + nandayo, {embed})
  }
}
