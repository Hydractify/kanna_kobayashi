const embeds = require('../util/embeds');
const Command = require('../engine/commandClass');
const get = require('../util/get');

module.exports = class Kiss extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['ks'],
      name: 'kiss',
      description: 'Kiss Someone! 👀',
      usage: 'kiss <user>',
      example: ['kiss @Wizardλ#4559'],
      category: 'int',
      coins: 75,
      exp: 125
    });
  }

  async run(client, message, color, args)
  {
    const embed = await embeds.wolke('kiss', color, message);

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
        nandayo = `**${memberu.displayName}** you got kissed by **${message.member.displayName}**`;
        embed.setDescription(`That's lewd o o`);
      }
      else if(member.user.id === client.user.id)
      {
        nandayo = `T-that's... LEWD`;
      }
      else
      {
        nandayo = `**${memberu.displayName}** you got kissed by **${message.member.displayName}**`;
      }
    }
    else
    {
      return message.channel.send(`${message.author} you must tell me who you want to kiss O///O`);
    }

    await message.channel.send('<:lewd:320406420824653825> | ' + nandayo, {embed})
  }
}
