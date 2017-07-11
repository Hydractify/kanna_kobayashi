const Command = require('../engine/commandClass');
const embeds = require('../util/embeds');

module.exports = class Lewd extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['l00d'],
      name: 'lewd',
      category: 'int',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    const embed = await embeds.wolke('lewd', color, message);

    await message.channel.send({embed});
  }
}
