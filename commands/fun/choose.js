const Command = require('../../structures/Command');

class ChooseCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['choice'],
			description: 'Let the bot choose one of the supplied options.',
			examples: ['choose Tohru|Kanna', 'choose Tohru Kanna'],
			name: 'choose',
			usage: 'choose <...options>'
		});
	}

	run(message, args) {
		if (!args.length) return message.reply(`you must give me options! (\`${this.usage}\`)`);

		const joined = args.join(' ');

		const options = joined.includes('|')
			? joined.split('|')
			: args;

		const answer = options[Math.floor(Math.random() * options.length)];
		return message.channel.send(`I choose **${answer}**`);
	}
}

module.exports = ChooseCommand;
