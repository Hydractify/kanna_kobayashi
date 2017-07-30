const Command = require('../../cogs/commands/framework');
const ibsearch = require('../../util/embeds/ibsearch');

module.exports = class SFW extends Command
{ constructor()
  { super(
    {
      name: 'sfw',
      alias: ['ibsearch'],
      usage: 'sfw <tag>',
      examples: ['sfw mario', 'sfw weeb'],
      enabled: false	});	}

  async run(message, color, args)
  {
    if(args.includes('%') || args.includes('?') || args.includes('!') || args.includes('.') || args.includes('encodeURIComponent') || args.includes(':')) return message.channel.send(`Hey ${message.author}, you've input something that could break the search!`);

    const embed = await ibsearch(color, message, args);

    await message.channel.send({embed});	}	}
