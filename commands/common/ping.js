const Command = require('../../structures/Command');

class PingCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['pong', 'pang', '🅱ing', 'peng'],
			coins: 0,
			exp: 0,
			usage: 'ping',
			description: 'See how much time it takes me to receive your message!',
			name: 'ping',
			permLevel: 0,
			examples: ['ping']
		});
	}

	async run(message) {
		const sent = await message.channel.send('Searching for insects... <:KannaISee:315264557843218432>');
		await sent.edit([
			`It took me **${sent.createdTimestamp - message.createdTimestamp}ms** to find and eat all insects!`,
			` <:KannaOh:315264555859181568> ~~**(WS: ${Math.floor(this.client.ping)}ms)**~~`
		]);
	}
}

module.exports = PingCommand;
