const Command = require('../../structures/Command');

class DailyCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['dailies'],
			coins: 500,
			// One day 24 hours * 60 minutes * 60 second * 1000 milliseconds
			cooldown: 24 * 60 * 60 * 1000,
			description: 'Your daily 500 coins!',
			examples: ['daily'],
			name: 'daily',
			usage: 'daily'
		});
	}

	run(message) {
		return message.channel.send(`${message.author}, here are your daily 500 <:coin:330926092703498240>!`);
	}
}

module.exports = DailyCommand;
