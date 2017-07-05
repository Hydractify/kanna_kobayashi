const embeds = require('../util/embeds');
const Command = require('../engine/commandClass');
const get = require('../util/get');

module.exports = class Cuddle extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['cud'],
      name: 'cuddle',
      description: 'Cuddle Someone!',
      usage: 'cuddle <user>',
      example: ['cuddle @Wizardλ#4559'],
      category: 'int',
      coins: 75,
      exp: 125
    });
  }

  async run(client, message, color, args)
  {
    const member = await get.memberu(client, message, args);

    if(!member) return;

    const embed = await embeds.wolke('cuddle', color, message);

    let nandayo;

    if(args[0])
    {
      if (member.user.id === message.author.id)
      {
        nandayo = `Nya~`;
      }
      else if(member.user.id === '267727230296129536')
      {
        nandayo = `**${member.displayName}** you got cuddled by **${message.member.displayName}**!`;
        gif.setDescription(`**_ENTERING TSUNDERE MODE_**`);
      }
      else if(member.user.id === client.user.id)
      {
        nandayo = `Awww... _cuddles ${member.displayName}_`;
      }
      else
      {
        nandayo = `**${member.displayName}** you got cuddled by **${message.member.displayName}**!`;
      }
    }
    else
    {
      nandayo = `_cuddles ${member.toString()}_`;
    }

    await message.channel.send('<:ayy:315270615844126720> | ' + nandayo, {embed})
  }
}
