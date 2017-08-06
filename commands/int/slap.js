const ram = require('../../util/embeds/ram');
const memberu = require('../../util/fetch/member');
const info = require('../../data/client/info');
const Command = require('../../cogs/commands/framework');

module.exports = class Slap extends Command {
  constructor() {
    super({
      alias: ['ぱんぱん'],
      name: 'slap',
      description: 'Slap Someone!',
      usage: 'slap <user>',
      example: ['slap @Wizardλ#4559'],
      coins: 75,
      exp: 125,
      enabled: true
    });
  }

  async run(message, color, args) {
    if(!args[0]) {
      await message.channel.send(`${message.author} you must provide someone to slap!`);
      return;
    }

    let nandayo;

      const member = await memberu(message, args);

      if(!member) return;

      if (member.user.id === message.author.id) {
        return message.channel.send(`${message.author} you can't slap yourself!`);
      } else if (info.devs.includes(member.user.id)) {
        return message.channel.send(`You can\'t slap ${member.toString()}! :<`);
      } else if (member.user.id === this.client.user.id) {
        nandayo = `**${member.displayName}** has **S L A P P E D** **${message.member.displayName}**!`;
      } else {
        nandayo = `**${member.displayName}** you got slapped by **${message.member.displayName}**!`;
      }

      const embed = await ram('slap', color, message);

      await message.channel.send('<:nandayo:320406428999483393> | ' + nandayo, {embed})
    }
  }
