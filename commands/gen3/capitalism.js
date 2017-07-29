const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Capit extends Command
{ constructor()
  { super(
    { alias: ['capit'],
      name: 'capitalism',
      enabled: true	});	}

  async run(message, color)
  {	let img = require('../../data/links').memes.capitalism;

    await message.channel.send({embed:meme(img, color, message)});	}	}
