const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Listen extends Command
{ constructor()
  { super(
    { alias: ['heylisten'],
      category: 'gen2',
      name: 'listen',
      enabled: true	});	}

  async run(message, pinku)
  { let image = require('../../data/links.json').memes.listen;

    await message.channel.send({embed : meme(image, pinku, message)});	}	}