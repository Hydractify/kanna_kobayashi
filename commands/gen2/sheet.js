const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Sheet extends Command
{ constructor()
  { super(
    { alias: ['shit'],
      name: 'sheet',
      enabled: true	});	}

  async run(message, color)
  {	let image = require('../../data/links').memes.sheet;

    await message.channel.send({embed : meme(image, color, message)});	}	}