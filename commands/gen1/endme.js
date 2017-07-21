const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class EndMe extends Command
{ constructor()
  { super(
    { alias: ['plsendmylifeijustwanttostopfeelingthepainthatisbeinglonely'],
      name: 'endme',
      enabled: true	});	}

  async run(message, color)
  { let img = require('../../data/links').memes.endme;

    await message.channel.send({embed : meme(img, color, message)});	}	}
