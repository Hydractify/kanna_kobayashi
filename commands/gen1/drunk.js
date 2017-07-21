const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Drunk extends Command
{ constructor()
  { super(
    { alias: ['sake'],
      name: 'drunk',
      enabled: true	});	}

  async run(message, color)
  { let image = require('../../data/links').memes.drunk;

    await message.channel.send('You have to be this cute to be drunk  <:lewd:320406420824653825>', {embed : meme(image, color, message)});	}	}
