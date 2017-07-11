const Command = require('../engine/commandClass');
const embeds = require('../util/embeds');

module.exports = class Pregnant extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['fbi'],
      name: 'pregnant',
      category: 'gen1',
      enabled: true
    });
  }

  async run(client, message, color)
  {
    let image = require('../util/links').memes.pregnant;
    let embed = embeds.meme(image, color, message);

    await message.channel.send(`Fear FBI **${message.member.displayName}**!`, {embed});
  }
}
