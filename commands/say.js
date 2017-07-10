const Command = require('../engine/commandClass');

module.exports = class Say extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['echo'],
      name: 'say',
      exp: 0,
      coins: 0,
      example: ['say hi!'],
      description: 'Tell me something to say!'
    });
  }

  async run(client, message, color, args)
  {
    if(!args[0]) return message.channel.send(`Tell me something to say ${message.author}!`);

    await message.channel.send(args.join(' '));
  }
}
