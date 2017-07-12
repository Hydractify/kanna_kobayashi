const Command = require('../engine/commandClass');
const embeds = require('../util/embeds');

module.exports = class Cat extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['neko'],
      name: 'cat',
      category: 'easter_egg',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    const embed = await embeds.cat(color, message);

    await message.channel.send({embed});
  }
}
