const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Comfy extends Command
{ constructor()
  { super(
    { name: 'comfy',
      alias: ['comfu'],
      enabled: true });	}

  async run(message, color)
  { let img = require('../../data/links').memes.comfy;

    var image = img[Math.floor(Math.random() * img.length)];

    await message.channel.send({embed: meme(image, color, message)});	}	}
