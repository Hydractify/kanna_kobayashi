const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class FlatIsJustice extends Command
{ constructor()
  { super(
    { alias: ['flat'],
      name: 'flatisjustice',
      enabled: true	});	}

  async run(message, color)
  {	let img = require('../../data/links').memes.flatisjustice;

    await message.channel.send({embed : meme(img, color, message)});	}	}