const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Cancer extends Command
{ constructor()
  { super(
    { name: 'cancer',
      alias: ['whykannahavesacancercommand'],
      enabled: true	});	}

  async run(message, color)
  {	let img = require('../../data/links').memes.cancer;

    await message.channel.send({embed : meme(img, color, message)});	}	}