const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 

module.exports = class Hungry extends Command
{ constructor()
  { super(
    { alias: ['itadakimasu'],
      name: 'hungry',
      enabled: true	});	}

  async run(message, color)
  { let i = require('../../data/links').memes.hungry;
    let image = i[Math.floor(Math.random() * i.length)];

    await message.channel.send({embed : meme(image, color, message)});	}	}
