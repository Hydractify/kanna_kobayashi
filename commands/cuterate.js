const Command = require('../engine/commandClass');

module.exports = class Cuterate extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['kawaiirate', 'cuteness', 'kawaiiness'],
      name: 'cuterate',
      example: ['cutemeter @Wizardλ#4559'],
      usage: 'cutemeter <user>',
      category: 'int'
    });
  }

  async run(client, message, color, args)
  {
    const member = await get.memberu(client, message, args);

    if(!member) return;

  }
}
