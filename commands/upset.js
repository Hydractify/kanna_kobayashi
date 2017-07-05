const embeds = require('../util/embeds');
const Command = require('../engine/commandClass');
const get = require('../util/get');

module.exports = class Upset extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['sad', 'cry'],
      name: 'upset',
      description: 'Show how upset you are... _pat_... Hope you\'re ok -Att. Wizardλ#5679',
      usage: 'cry <user>',
      example: ['cry @Wizardλ#4559', 'cry'],
      category: 'int',
      coins: 75,
      exp: 125
    });
  }

  async run(client, message, color, args)
  {
    const member = await get.memberu(client, message, args);

    if(!member) return;

    const embed = await embeds.wolke('cry', color, message);

    let nandayo;

    if(args[0])
    {
      if (member.user.id === message.author.id)
      {
        nandayo = `**${message.member.displayName}** is upset...`;
      }
      else if(member.user.id === '267727230296129536')
      {
        nandayo = `**${message.member.displayName}** is upset with my master...`;
        embed.setDescription(`_Master what have you done..._`)
      }
      else if(member.user.id === client.user.id)
      {
        nandayo = `Why you are upset with me **${message.member.displayName}**...?`;
      }
      else
      {
        nandayo = `**${message.member.displayName}** is upset with **${member.displayName}**...`;
      }
    }
    else
    {
      nandayo = `**${message.member.displayName}** is upset...`;
    }

    await message.channel.send('<:ayy:315270615844126720> | ' + nandayo, {embed})
  }
}
