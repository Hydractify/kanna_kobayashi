const embeds = require('../util/embeds');
const Command = require('../engine/commandClass');
const get = require('../util/get');

module.exports = class Kiss extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['suck'],
      name: 'succ',
      description: 'Succ Someone! 👀',
      usage: 'succ <user>',
      example: ['succ @Wizardλ#4559'],
      category: 'int',
      coins: 75,
      exp: 125,
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    const embed = await embeds.meme(require('../util/links').memes.succ, color, message);

    let nandayo;

    if(args[0])
    {
      const member = await get.memberu(client, message, args);

      if(!member) return;

      if (member.user.id === message.author.id)
      {
        return message.channel.send(`You can't kiss yourself O///O`);
      }
      else if(require('../util/settings').client.devs.includes(member.user.id))
      {
        nandayo = `**${message.member.displayName}** has succ ${member.displayName}`;
        embed.setDescription(`wew`);
      }
      else if(member.user.id === client.user.id)
      {
        nandayo = `I'll succ you entirely **${message.member.displayName}**`;
      }
      else
      {
        nandayo = `**${message.member.displayName}** has succ ${member.displayName}`;
      }
    }
    else
    {
      nandayo = 'Succ';
    }

    await message.channel.send('<:hmm:315264556282675200> | ' + nandayo, {embed})
  }
}
