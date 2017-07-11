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
      enabled: false
    });
  }

  async run(client, message, color, args)
  {
    const shard = new Discord.ShardClientUtil(client);

    if(!args[0]) shard.broadcastEval('console.log(this)');

    if(args[0].toLowerCase().startsWith('stream')) shard.broadcastEval('this.client.user.setGame(`${args.slice(1).join(\' \')} [${shard.id}]`, https://twtich.com/wizzardlink)');

    if(args[0] && !args[0].toLowerCase().startsWith('stream')) shard.broadcastEval('this.client.user.setGame(`${args.join(\' \')} [${shard.id}]`)');
  }
}
