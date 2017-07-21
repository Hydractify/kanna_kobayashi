const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Ernie extends Command
{ constructor()
  { super(
    { alias: ['puppet'],
      name: 'ernie',
      enabled: true	});	}

  async run(message, color)
  { let img = require('../../data/links').memes.ernie;

    await message.channel.send({embed : meme(img, color, message)});	}	}
