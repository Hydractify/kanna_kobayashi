const embeds = require('../util/embeds');
const Command = require('../engine/commandClass');
const get = require('../util/get');

module.exports = class Pat extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['パット'],
      name: 'pat',
      description: 'Pat Someone!',
      usage: 'pat <user>',
      example: ['pat @Wizardλ#4559'],
      category: 'int',
      coins: 75,
      exp: 125,
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    const embed = await embeds.wolke('pat', color, message);

    let nandayo;

    if(args[0])
    {
      const member = await get.memberu(client, message, args);

      if(!member) return;

      if (member.user.id === message.author.id)
      {
        nandayo = `Aww... pats **${message.member.displayName}**`;
      }
      else if(require('../util/settings').client.devs.includes(member.user.id))
      {
        nandayo = `**${member.displayName}** you got a pat from **${message.member.displayName}**!`;
        embed.setDescription(`That's cute :3`);
      }
      else if(member.user.id === client.user.id)
      {
        nandayo = `You are cute **${message.member.displayName}** :3`;
      }
      else
      {
        nandayo = `**${member.displayName}** you got a pat from **${message.member.displayName}**!`;
      }
    }
    else
    {
      return message.channel.send(`${message.author} you must tell me someone you want to pat!`)
    }

    await message.channel.send('<:ayy:315270615844126720> | ' + nandayo, {embed})
  }
}
