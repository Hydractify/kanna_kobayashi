const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class DoIt extends Command
{ constructor()
  { super(
    { alias: ['worship'],
      name: 'doit',
      enabled: true	});	}

  async run(message, color)
  { let img = require('../../data/links').memes.doit;

    await message.channel.send(`<:omfg:315264558279426048> | **Do it ${message.author}**`, {embed: meme(img, color, message)});	}	}
