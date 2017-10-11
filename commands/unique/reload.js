const Command = require('../../structures/Command');

class ReloadCommand extends Command {
	constructor(handler) {
		super(handler, {
			coins: 0,
			cooldown: 0,
			description: 'Reloads a command',
			examples: ['You should know how to use this.'],
			exp: 0,
			name: 'reload',
			usage: 'You should know how to use this.',
			permLevel: 4,
			aliases: ['r']
		});
	}

	async run(message, [commandName]) {
		if (!commandName) return message.channel.send('You should supply a command to reload.');

		const results = await this.client.shard.broadcastEval(`this.commandHandler.reload('${commandName}')`)
			.then(result =>
				result.map(res =>
					`Shard: ${res[0]} - ${res[1].message ? `\`${res[1].message}\`` : res[1] ? 'Success' : 'Not found'}`)
			);

		return message.channel.send(results.join('\n'));
	}
}

module.exports = ReloadCommand;
