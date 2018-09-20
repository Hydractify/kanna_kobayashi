import { Message } from 'discord.js';

import { Guild } from '../../models/Guild';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';

class CommandStatusCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'See whether a command is enabled or disabled',
			examples: ['commandstatus', 'commandstatus say'],
			guarded: true,
			usage: 'commandstatus [Command]',
		});
	}

	public parseArgs(message: Message, args: string[]): Command[] | string[] | string {
		if (!args.length) return args;

		const command: Command | undefined = this.handler.resolveCommand(args.join(' ').toLowerCase());

		if (!command) return 'I could not find a command with that name or alias.';

		return [command];
	}

	public async run(
		message: Message,
		[command]: [Command | undefined],
	): Promise<Message | Message[]> {
		const guildModel: Guild = message.guild.model;

		if (!command) {
			if (!guildModel.disabledCommands.length) {
				return message.reply([
					'there are currently no commands server wide disabled.',
					'',
					'If you intended to get a list of available commands instead, try `k!help`.',
				].join('\n'));
			}

			return message.reply([
				'the following commands are currently server wide disabled:',
				`\`${guildModel.disabledCommands.join('`, `')}\``,
				'',
				'If you intended to get a list of available commands instead, try `k!help`.',
			].join('\n'));
		}

		const status: boolean = !guildModel.disabledCommands.includes(command.name);

		return message.reply([
			`the **${command.name}** command is currently server wide ${status ? 'enabled' : 'disabled'}.`,
			'',
			`If you intended to get help about the **${command.name}** command instead, use \`k!help ${command.name}\`.`,
		].join('\n'));
	}
}

export { CommandStatusCommand as Command };
