const Command = require('../../structures/Command');
const { parseFlags } = require('../../util/util');

class DeleteCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['purge'],
			clientPermissions: ['MANAGE_MESSAGES'],
			cooldown: 5000,
			enabled: true,
			description: 'Use this command to delete messages... And maybe hide them... <:KannaISee:315264557843218432>',
			examples: ['delete 30', 'delete 20 bots', 'delete 10 wizard'],
			name: 'delete',
			usage: 'delete <Number|ID> [\'bots\'|User]',
			permLevel: 0
		});
	}

	async run(message, [input, option]) {
		
	}
}

module.exports = DeleteCommand;
