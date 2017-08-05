const Command = require('../../cogs/commands/framework');
const sanitizeQuotes = require('../../util/sanitizeQuotes');

module.exports = class SetGame extends Command {
  constructor() {
    super({
      alias: ['sg'],
      permLevel: 4,
      name: 'setgame',
      coins: 0,
      exp: 0,
      description: 'Pretty obvious am i right',
      enabled: true
    });
  }

  async run(message, color, args) {
    const shard = this.client.shard;
    const clientValues = await shard.fetchClientValues('guilds.size');
    let totalGuilds = clientValues.reduce((prev, val) => prev + val, 0);

    if(args[0]) {
      if(args[0].toLowerCase().startsWith('stream')) {
        shard.broadcastEval(`this.user.setGame('${sanitizeQuotes(args.slice(1).join(' '))}  [' + this.shard.id + ']', 'https://twitch.tv/wizzardlink')`);
      } else {
        shard.broadcastEval(`this.user.setGame('${sanitizeQuotes(args.join(' '))} [' + this.shard.id + ']')`);
      }
    } else {
      shard.broadcastEval(`this.user.setGame('k!help | on ${totalGuilds} guilds [' + this.shard.id + ']')`);
    }
  }
}
