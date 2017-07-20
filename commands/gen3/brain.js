const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class BrAiNe extends Command
{ constructor()
  { super(
    { alias: ['braine'],
      name: 'brain',
      enabled: true	});	}

  async run(message, color)
  { let img = require('../../data/links').memes.brain;

    await message.channel.send({embed : meme(img, color, message)});	}	}