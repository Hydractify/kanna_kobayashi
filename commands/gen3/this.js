const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme'); 

module.exports = class This extends Command
{ constructor()
  { super(
    { alias: ['dis'],
      name: 'this',
      enabled: true	});	}

  async run(message, pinku)
  { let image = require('../../data/links.json').memes.this;

    await message.channel.send({embed : meme(image, pinku, message)});	}	}