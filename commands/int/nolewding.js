const Command = require('../../cogs/commands/framework');
const common = require('../../util/embeds/common');
const memberu = require('../../util/fetch/member');

module.exports = class NoLewding extends Command
{ constructor()
  { super(
    { alias: ['nlewd'],
      name: 'nolewding',
      enabled: true	});	}

  async run(message, color, args)
  { let image = require('../../data/links').memes.nolewding;
    const embed = common(color, message).setImage(image);

    let nandayo;

    if(args[0])
    { const member = await memberu(message, args);

      if(!member) return;

      if(!args[0] || member.user.id === message.author.id)
      {	nandayo = `ARE YOU LEWDING ${message.author.id}?! <:omfg:315264558279426048>`;	}
      else if(member.user.id === this.client.user.id)
      {	nandayo = `ARE YOU PRETENDING I'M LEWDING ${message.author}?!`;	}
      else if(require('../../data/client/info').devs.includes(member.user.id))
      {	nandayo = `No lewding allowed on my watch ${message.author}!`;	}
      else
      {	nandayo = `No lewding allowed on my watch **${member.displayName}**!`;	}
    }
    else
    {	nandayo = `<:hmm:315264556282675200>`;	}

    await message.channel.send(nandayo, {embed});	}	}
