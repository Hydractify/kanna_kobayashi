const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Rem extends Command
{ constructor()
  { super(
    { alias: ['reimu'],
      name: 'rem',
      enabled: true	});	}

  async run(message, color)
  { let image = require('../../data/links').memes.rem;

    await message.channel.send({embed : meme(image, color, message)});	}	}