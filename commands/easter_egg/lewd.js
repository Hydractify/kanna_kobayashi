const Command = require('../../cogs/commands/framework');
const ram = require('../../util/embeds/ram');

module.exports = class Lewd extends Command
{ constructor()
  { super(
    { alias: ['l00d'],
      name: 'lewd',
      enabled: true	});	}

  async run(message, color)
  { const embed = await ram('lewd', color, message);

    await message.channel.send({embed});  } }