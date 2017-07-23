const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Ravioli extends Command
{ constructor()
  { super(
    { alias: ['praise'],
      category: 'gen4',
      name: 'ravioli',
      enabled: true	});	}

  async run(message, color)
  {	let image = require('../../data/links').memes.ravioli;

    await message.channel.send('<:oh:315264555859181568> | **Ravioli Ravioli all praise the Dragon Loli**', {embed : meme(image, color, message)});	}	}