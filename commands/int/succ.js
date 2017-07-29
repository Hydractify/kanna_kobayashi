const memberu = require('../../util/fetch/member');
const info = require('../../data/client/info');
const Command = require('../../cogs/commands/framework');
const meme = require('../../util/embeds/meme'); 

module.exports = class Kiss extends Command
{ constructor()
  { super(
    { alias: ['suck'],
      name: 'succ',
      description: 'Succ Someone! 👀',
      usage: 'succ <user>',
      example: ['succ @Wizardλ#4559'],
      coins: 75,
      exp: 125,
      enabled: true	});	}

  async run(message, color, args)
  { const embed = await meme(require('../../data/links').memes.succ, color, message);

    let nandayo;

    if (args[0])
    { const member = await memberu(message, args);

      if (!member) return;

      if (member.user.id === message.author.id)
      {	return message.channel.send(`You can't suck yourself O///O`);	}
      else if (info.devs.includes(member.user.id))
      {	nandayo = `**${message.member.displayName}** has succ **${member.displayName}**`;
        embed.setDescription(`wew`);	}
      else if(member.user.id === this.client.user.id)
      {	nandayo = `I'll succ you entirely **${message.member.displayName}**`;	}
      else
      {	nandayo = `**${message.member.displayName}** has succ **${member.displayName}**`;	}	}
    else
    {	nandayo = 'Succ';	}

    await message.channel.send('<:hmm:315264556282675200> | ' + nandayo, {embed})	}	}