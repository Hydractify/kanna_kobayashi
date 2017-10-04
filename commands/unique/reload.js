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
			permLevel: 4
		});
	}

	run(message, [commandName]) {
		try {
			const command = this.handler.commands.get(commandName.toLowerCase())
				|| this.handler.commands.get(this.aliases.get(commandName.toLowerCase()));
			if (!command) return message.channel.send(`Could not find a command by the name or alias ${commandName}!`);

			command.reload();

			return message.channel.send(`Command **${command.name}** reloaded.`);
		} catch (error) {
			return message.channel.send([
				'**Error**',
				'```js',
				String(error),
				'```'
			]);
		}
	}
}

module.exports = ReloadCommand;
