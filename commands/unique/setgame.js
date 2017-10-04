const Command = require('../../structures/Command');

class SetGameCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['sg'],
			coins: 0,
			cooldown: 0,
			description: 'Sets the game the bot is currently playing on all shards',
			examples: ['setgame Some cool game'],
			exp: 0,
			name: 'setgame',
			usage: 'setgame [\'stream\'] [...Game]',
			permLevel: 4
		});
	}

	async run(message, args) {
		if (!args.length) {
			const totalGuilds = await this.client.shard.fetchClientValues('guilds.size')
				.then(result => result.reduce((previous, current) => previous + current));

			return this.setGame(`k!help | on ${totalGuilds} guilds`);
		}

		let stream = '';
		if (args[0].toLowerCase() === 'stream') {
			args = args.slice(1);
			stream = ', \'https://twitch.tv/wizzardlink\'';
		}

		return this.setGame(args.join(' '), stream);
	}

	setGame(game, stream) {
		return this.client.shard.broadcastEval(`this.user.setGame(\`${game} [\${this.shard.id}]\`${stream || ''});`);
	}
}

module.exports = SetGameCommand;
