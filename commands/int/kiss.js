const ram = require('../../util/embeds/ram');
const Command = require('../../cogs/commands/framework');
const memberu = require('../../util/fetch/member');
const info = require('../../data/client/info');

module.exports = class Kiss extends Command
{ constructor()
  { super(
    { alias: ['ks'],
      name: 'kiss',
      description: 'Kiss Someone! 👀',
      usage: 'kiss <user>',
      example: ['kiss @Wizardλ#4559'],
      coins: 75,
      exp: 125,
      enabled: true	});	}

  async run(message, color, args)
  { const embed = await ram('kiss', color, message);

    let nandayo;

    if(args[0])
    { const member = await memberu(message, args);

      if(!member) return;

      if (member.user.id === message.author.id)
      {	return message.channel.send(`You can't kiss yourself O///O`);	}
      else if(info.devs.includes(member.user.id))
      {	nandayo = `**${member.displayName}** you got kissed by **${message.member.displayName}**`;
        embed.setDescription(`That's lewd o o`);	}
      else if(member.user.id === this.client.user.id)
      {	return message.channel.send(`T-that's... LEWD... Don't <:lewd:320406420824653825>`);	}
      else
      {	nandayo = `**${member.displayName}** you got kissed by **${message.member.displayName}**`;	}	}
    else
    {	return message.channel.send(`${message.author} you must tell me who you want to kiss <:lewd:320406420824653825>`);	}

    await message.channel.send('<:lewd:320406420824653825> | ' + nandayo, {embed})	}	}
