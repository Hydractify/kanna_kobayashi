const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Laid extends Command
{ constructor()
  { super(
    { alias: ['paid', 'dragonmaid'],
      name: 'laid',
      enabled: true	});	}

  async run(message, pinku)
  { let image = require('../../data/links.json').memes.laid;

    await message.channel.send({embed : meme(image, pinku, message)});	}	}
