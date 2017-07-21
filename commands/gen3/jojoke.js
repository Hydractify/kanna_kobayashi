const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class JoJoke extends Command
{ constructor()
  { super(
    { alias: ['jjk'],
      name: 'jojoke',
      enabled: true	});	}

  async run(message, color)
  {	let i = require('../../data/links').memes.jojoke;
    let image = i[Math.floor(Math.random() * i.length)];

    await message.channel.send({embed : meme(image, color, message)});	}	}
