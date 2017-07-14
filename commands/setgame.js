const Command = require('../engine/commandClass');
const Discord = require('discord.js');

module.exports = class SetGame extends Command
{
  constructor(client)
  {
    super(client,
    {
      alias: ['sg'],
      permLevel: 4,
      name: 'setgame',
      category: 'unique',
      coins: 0,
      exp: 0,
      description: 'Pretty obvious am i right',
      enabled: true
    });
  }

  async run(client, message, color, args)
  {
    const shard = client.shard;
    const clientValues = await shard.fetchClientValues('guilds.size');
    let totalGuilds = clientValues.reduce((prev, val) => prev + val, 0);

    if(args[0])
    {
      if(args[0].toLowerCase().startsWith('stream'))
      {
        shard.broadcastEval(`this.user.setGame('${args.slice(1).join(' ')}  [' + this.shard.id + ']', 'https://twitch.tv/wizzardlink')`);
      }
      else
      {
        shard.broadcastEval(`this.user.setGame('${args.join(' ')} [' + this.shard.id + ']')`);
      }
    }
    else
    {
      shard.broadcastEval(`this.user.setGame('k!help | on ${totalGuilds} guilds [' + this.shard.id + ']')`);
    }
  }
}
