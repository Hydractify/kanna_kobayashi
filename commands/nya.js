const Command = require('../engine/commandClass');
const embeds = require('../util/embeds');

module.exports = class Nya extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['nyan'],
      name: 'nya',
      category: 'easter_egg',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    const embed = await embeds.wolke('nyan', color, message);

    await message.channel.send({embed});
  }
}
