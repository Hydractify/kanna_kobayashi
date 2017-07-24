const ram = require('../../util/embeds/ram');
const memberu = require('../../util/fetch/member');
const info = require('../../data/client/info');
const Command = require('../../cogs/commands/framework');
const { client } = require('../../cogs/connections/discord');

module.exports = class Pat extends Command
{ constructor()
  { super(
    { alias: ['パット'],
      name: 'pat',
      description: 'Pat Someone!',
      usage: 'pat <user>',
      example: ['pat @Wizardλ#4559'],
      coins: 75,
      exp: 125,
      enabled: true	});	}

  async run(message, color, args)
  {	if(args[0])
    { const embed = await ram('pat', color, message);
	    const member = await memberu(message, args);
	    let nandayo;

      if(!member) return;

      if (member.user.id === message.author.id)
      {	nandayo = `Aww... pats **${message.member.displayName}**`;	}
      else if(info.devs.includes(member.user.id))
      {	nandayo = `**${member.displayName}** you got a pat from **${message.member.displayName}**!`;
        embed.setDescription(`That's cute :3`);	}
      else if(member.user.id === client.user.id)
      {	nandayo = `You are cute **${message.member.displayName}** :3`;	}
      else
      {	nandayo = `**${member.displayName}** you got a pat from **${message.member.displayName}**!`;	}	}
    else
    {	return message.channel.send(`${message.author} you must tell me who you want to pat!`)	}

    await message.channel.send('<:ayy:315270615844126720> | ' + nandayo, {embed})	}	}