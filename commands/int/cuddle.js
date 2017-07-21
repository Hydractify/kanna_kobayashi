const ram = require('../../util/embeds/ram');
const memberu = require('../../util/fetch/member');
const info = require('../../data/client/info');
const Command = require('../../cogs/commands/framework');
const { client } = require('../../cogs/connections/discord');
const blacklist = require('../../data/client/blacklist');

module.exports = class Cuddle extends Command
{ constructor()
  { super(
    { alias: ['cud'],
      name: 'cuddle',
      description: 'Cuddle Someone!',
      usage: 'cuddle <user>',
      example: ['cuddle @Wizardλ#4559'],
      coins: 75,
      exp: 125,
      enabled: true	});	}

  async run(message, color, args)
  {
    const embed = await ram('cuddle', color, message);

    let nandayo;

    if (args[0])
    { const member = await memberu(message, args);

      if (!member) return;

      if (member.user.id === message.author.id)
      {	nandayo = `Nya~`;	}
      else if (info.devs.includes(member.user.id))
      { nandayo = `**${member.displayName}** you got cuddled by **${message.member.displayName}**!`;
        embed.setDescription(`**_ENTERING TSUNDERE MODE_**`);	}
      else if (member.user.id === client.user.id)
      {	nandayo = `Awww... _cuddles **${message.member.displayName}**_`;	}
      else
      {	nandayo = `**${member.displayName}** you got cuddled by **${message.member.displayName}**!`;	}	}
    else
    {	nandayo = `_cuddles ${message.member.toString()}_`;	}

    await message.channel.send('<:ayy:315270615844126720> | ' + nandayo, {embed})	}	}
