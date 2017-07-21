const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Dab extends Command
{ constructor()
  { super(
    { alias: ['dabu'],
      name: 'dab',
      enabled: true	});	}

  async run(message, color)
  { let image = require('../../data/links').memes.dab;

    await message.channel.send({embed : embed.meme(image, color, message)});	}	}
