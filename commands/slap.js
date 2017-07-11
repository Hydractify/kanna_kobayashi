const embeds = require('../util/embeds');
const Command = require('../engine/commandClass');
const get = require('../util/get');

module.exports = class Slap extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['ぱんぱん'],
      name: 'slap',
      description: 'Slap Someone!',
      usage: 'slap <user>',
      example: ['slap @Wizardλ#4559'],
      category: 'int',
      coins: 75,
      exp: 125,
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    if(!args[0]) return message.channel.send(`${message.author} you must provide someone to slap!`)

    const embed = await embeds.wolke('slap', color, message);

    let nandayo;

      const member = await get.memberu(client, message, args);

      if(!member) return;

      if (member.user.id === message.author.id)
      {
        return message.channel.send(`${message.author} you can't slap yourself!`);
      }
      else if(require('../util/settings').client.devs.includes(member.user.id))
      {
        return message.channel.send(`You can\'t slap ${member.toString()}! :<`);
      }
      else if(member.user.id === client.user.id)
      {
        nandayo = `**${member.displayName}** has **S L A P P E D** **${message.member.displayName}**!`;
      }
      else
      {
        nandayo = `**${member.displayName}** you got slapped by **${message.member.displayName}**!`;
      }

    await message.channel.send('<:nandayo:320406428999483393> | ' + nandayo, {embed})
  }
}
