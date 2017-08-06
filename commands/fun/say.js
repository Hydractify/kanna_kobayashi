const Command = require('../../cogs/commands/framework');

module.exports = class Say extends Command {
  constructor() {
    super({
      alias: ['echo'],
      name: 'say',
      exp: 0,
      coins: 0,
      example: ['say hi!'],
      usage: 'say <message>',
      description: 'Tell me something to say!',
      enabled: true
    });
  }

  async run(message, color, args) {
    if(!args[0]) return message.channel.send(`Tell me something to say ${message.author}!`);

    await message.channel.send(args.join(' '));
  }
}
