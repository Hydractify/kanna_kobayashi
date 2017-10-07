const Command = require('../../structures/Command');

class LevelUpCommand extends Command {
	constructor(handler) {
		super(handler, {
			coins: 0,
			description: 'Gets or sets whether level up message should be sent in this guild.',
			examples: [
				'levelup',
				'levelup true',
				'levelup false'
			],
			exp: 0,
			name: 'levelup',
			usage: 'levelup [\'true\'|\'false\']',
			permLevel: 2
		});
	}

	async run(message, [state]) {
		state = state.toLowerCase();
		if (!state || !['true', 'false'].includes(state)) {
			return message.channel.send(
				`Level up messages are currently ${message.guild.model.levelUpEnabled ? 'enabled' : 'disabled'}.`
			);
		}

		if ((state === 'true') === message.guild.model.levelUpEnabled) {
			return message.channel.send(
				`Level up message are already ${message.guild.model.levelUpEnabled ? 'enabled' : 'disabled'}`
			);
		}

		// No eval for type coercion, never 🔪
		message.guild.model.levelUpEnabled = state === 'true';
		await message.guild.model.save();

		return message.channel.send(
			`Level up message in this guild are now ${message.guild.model.levelUpEnabled ? 'enabled' : 'disabled'}`
		);
	}
}

module.exports = LevelUpCommand;
