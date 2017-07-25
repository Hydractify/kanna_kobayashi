const ram = require('../../util/embeds/ram');
const memberu = require('../../util/fetch/member');
const info = require('../../data/client/info');
const Command = require('../../cogs/commands/framework');
const { client } = require('../../cogs/connections/discord');
const blacklist = require('../../data/client/blacklist');

module.exports = class Tickle extends Command
{ constructor()
  { super(
    { alias: ['fear'],
      name: 'tickle',
      description: 'Tickle Someone!',
      usage: 'tickle <user>',
      example: ['tickle @Wizardλ#4559'],
      coins: 75,
      exp: 125,
      enabled: true	});	}

  async run(message, color, args)
  {
    const embed = await ram('tickle', color, message);

    let nandayo;

    if (args[0])
    { const member = await memberu(message, args);

      if (!member) return;

      if (member.user.id === message.author.id)
      {	nandayo = `${member.toString()} is... tickling himself?`;	}
      else if (info.devs.includes(member.user.id))
      { nandayo = `**${member.displayName}** you got tickled by **${message.member.displayName}**!`;
        embed.setDescription(`**_poor ${member.user.username}_**`);	}
      else if (member.user.id === client.user.id)
      {	nandayo = `Please don't... i can't stop laughing!`;	}
      else
      {	nandayo = `**${member.displayName}** you got tickled by **${message.member.displayName}**!`;	}	}
    else
    {	nandayo = `_tickles ${message.member.toString()}_`;	}

    await message.channel.send('<:ayy:315270615844126720> | ' + nandayo, {embed})	}	}
