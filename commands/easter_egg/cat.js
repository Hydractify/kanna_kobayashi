const Command = require('../../cogs/commands/framework');
const cat = require('../../util/embeds/cat');

module.exports = class Cat extends Command {
  constructor() {
    super({
      alias: ['neko'],
      name: 'cat',
      enabled: true
    });
  }

  async run(message, color) {
    const embed = await cat(color, message);

    await message.channel.send({embed});
  }
}
