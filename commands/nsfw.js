const Command = require('../engine/commandClass');
const embeds = require('../util/embeds');

module.exports = class SFW extends Command
{
  constructor(client)
  {
    super(client,
    {
      name: 'nsfw',
      alias: ['xxx'],
      category: 'weeb',
      usage: 'nsfw <tag>',
      examples: ['nsfw mario', 'nsfw weeb'],
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    if(args.includes('kanna') || args.includes('kobayashi') || args.includes('kamui')) return message.channel.send(`${message.author}... What are you thinking... ? <:omfg:315264558279426048>`);

    if(args.includes('%') || args.includes('?') || args.includes('!') || args.includes('.') || args.includes('encodeURIComponent') || args.includes(':')) return message.channel.send(`Hey ${message.author}, you've input something that could break the search!`);

    const embed = await embeds.ibsearch_xxx(client, color, message, args);

    await message.channel.send({embed});
  }
}
