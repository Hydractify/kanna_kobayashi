const Command = require('../engine/commandClass');

module.exports = class Ping extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['pong'],
      category: 'common',
      name: 'ping',
      exp: 0,
      coins: 0 
    });
  }

  async run(client, message)
  {
    let pingo = await message.channel.send('Eating insects...');

    await pingo.edit(`I took \`${pingo.createdTimestamp - message.createdTimestamp} ms\` to eat all of them <:oh:315264555859181568>`);
  }
}
