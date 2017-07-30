const Command = require('../../cogs/commands/framework');
const ram = require('../../util/embeds/ram');

module.exports = class Kawaii extends Command {
  constructor() {
    super({
      alias: ['whatdidyoufuckingsaidyoumotherfuckingweeb'],
        name: 'stare',
        enabled: true
      });
    }

  async run(message, color) {
    const embed = await ram('stare', color, message);

    await message.channel.send({embed});
  }
}
