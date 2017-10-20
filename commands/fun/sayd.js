const Command = require('../../structures/Command');

class SayDeleteCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['sayd'],
			clientPermissions: ['MANAGE_MESSAGES'],
			coins: 0,
			description: 'Let the bot say something and delete your message afterwards.',
			examples: ['sayd Hello world!'],
			exp: 0,
			name: 'saydelete',
			usage: 'sayd <...Message>'
		});
	}

	run(message, [first], { commandName }) {
		if (!first) return message.reply('you need to give me something to say!');

		// Clean content to avoid mentions and such (everyone and here are disabled per client options)
		const content = message.cleanContent.slice(message.cleanContent.indexOf(commandName) + commandName.length);

		return Promise.all([
			message.delete(),
			message.channel.send(content)
		]);
	}
}

module.exports = SayDeleteCommand;
