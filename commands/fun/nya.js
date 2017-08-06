const Command = require('../../cogs/commands/framework');
const ram = require('../../util/embeds/ram');

module.exports = class Nya extends Command {
  constructor() {
    super({
      alias: ['nyan'],
      name: 'nya',
      enabled: true
    });
  }

  async run(message, color) {
    const embed = await ram('nyan', color, message);

    await message.channel.send({embed});
  }
}
