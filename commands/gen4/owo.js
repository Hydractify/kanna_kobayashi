const Command = require('../../cogs/commands/framework'); 
const ram = require('../../util/embeds/ram'); 

module.exports = class OwO extends Command
{ constructor()
  { super(
    { alias: ['whatsthis'],
      name: 'owo',
      enabled: true	});	}

  async run(message, color)
  {	const embed = await ram('owo', color, message);

    await message.channel.send({embed});	}	}