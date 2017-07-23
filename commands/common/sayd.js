const Command = require('../../cogs/commands/framework'); 

module.exports = class SayDelete extends Command
{ constructor()
  { super(
    { alias: ['echod'],
      name: 'sayd',
      exp: 0,
      coins: 0,
      usage: 'sayd <message>',
      example: ['sayd I\'m Kanna!'],
      description: 'Tell me something to say ~~and i hide your message~~!',
      enabled: true	});	}

  async run(message, color, args)
  {	if(!args[0]) return message.channel.send(`Tell me something to say ${message.author}!`);

    if(!message.guild.me.permissions.has('MANAGE_MESSAGES')) return message.channel.send(`I don\'t have permission to delete your message ${message.author}!`);

    await message.delete();
    await message.channel.send(args.join(' '));	}	}