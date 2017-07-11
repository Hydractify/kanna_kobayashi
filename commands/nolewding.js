const Command = require('../engine/commandClass');
const embeds = require('../util/embeds');
const get = require('../util/get');

module.exports = class NoLewding extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['nlewd'],
      name: 'nolewding',
      category: 'int',
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    let image = require('../util/links').memes.nolewding;
    const embed = embeds.common(color, message).setImage(image);

    let nandayo;

    if(args[0])
    {
      const member = await get.memberu(client, message, args);

      if(!member) return;

      if(!args[0] || member.user.id === message.author.id)
      {
        nandayo = `ARE YOU LEWDING ${message.author.id}?! <:omfg:315264558279426048>`;
      }
      else if(member.user.id === client.user.id)
      {
        nandayo = `ARE YOU PRETENDING I'M LEWDING ${message.author}?!`;
      }
      else if(require('../util/settings').client.devs.includes(member.user.id))
      {
        nandayo = `No lewding allowed on my watch ${message.author}!`;
      }
      else
      {
        nandayo = `No lewding allowed on my watch **${member.displayName}**!`;
      }
    }
    else
    {
      nandayo = `<:hmm:315264556282675200>`;
    }

    await message.channel.send(nandayo, {embed});
  }
}
