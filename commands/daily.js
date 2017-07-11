const Command = require('../engine/commandClass');
const User = require('../engine/User');

module.exports = class Daily extends Command
{
  constructor(client)
  {
    super(client,
    {
      name: 'daily',
      coins: 300,
      description: 'Get free coins!',
      alias: ['freecoins'],
      cooldown: 86400000,
      enabled: true
    })
  }

  async run(client, message)
  {
    message.channel.send(`${message.author} you've got your daily **300**<:coin:330926092703498240>!`)
  }
}
