const ram = require('../../util/embeds/ram');
const memberu = require('../../util/fetch/member');
const info = require('../../data/client/info');
const Command = require('../../cogs/commands/framework');

module.exports = class Hug extends Command
{ constructor()
  { super(
    { alias: ['抱擁'],
      name: 'hug',
      description: 'Hug Someone!',
      usage: 'hug <user>',
      example: ['hug @Wizardλ#4559'],
      coins: 75,
      exp: 125,
      enabled: true	});	}

  async run(message, color, args)
  { const embed = await ram('hug', color, message);

    let nandayo;

    if(args[0])
    { const member = await memberu(message, args);

      if(!member) return;

      if (member.user.id === message.author.id)
      { nanadyo = `I'll hug you **${message.member.displayName}**! <:ayy:315270615844126720>`;	}
      else if (info.devs.includes(member.user.id))
	  { nandayo = `**${member.displayName}** you got hugged by **${message.member.displayName}**!`;
        embed.setDescription(`**${message.member.displayName}**... OwO`);	}
      else if(member.user.id === this.client.user.id)
      {	nandayo = `You are so cute **${message.member.displayName}** :3`;
        embed.setDescription(`_hugs_ ${message.author}`);	}
      else
      {	nandayo = `**${member.displayName}** you got hugged by **${message.member.displayName}**!`;	}	}
    else
    {	nandayo = `_hugs ${message.member.toString()}_`;	}

    await message.channel.send('<:hugme:299650645001240578> | ' + nandayo, {embed})	}	}
