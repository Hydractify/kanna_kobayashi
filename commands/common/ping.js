const Command = require('../../structures/Command');

class PingCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['pong', 'pang', '🅱ing', 'peng'],
			coins: 0,
			exp: 0,
			usage: 'ping',
			description: 'See how much time i take to receive your message!',
			name: 'ping',
			permLevel: 0,
			examples: ['ping']
		});
	}

	async run(message) {
		const Message = await message.channel.send('Searching for insects... <:KannaISee:315264557843218432>');
		await Message.edit([
			`I took **${Message.createdTimestamp - message.createdTimestamp}ms** to find and eat all insects!`,
			` <:KannaOh:315264555859181568> ~~**(WS: ${Math.floor(this.client.ping)}ms)**~~`
		]);
	}
}

module.exports = PingCommand;
