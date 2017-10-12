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
		if (!args.length) return message.reply(`you must give me something to choose from! (\`${this.usage}\`)`);

		const joined = args.join(' ');

		const options = joined.includes('|')
			? joined.split('|')
			: args;

		if (options.length === 1) return message.reply(`I chose the only available option **${options[0]}**!`);

		const answer = options[Math.floor(Math.random() * options.length)];
		return message.reply(`I chose **${answer}**!`);
	}
}

module.exports = ChooseCommand;
