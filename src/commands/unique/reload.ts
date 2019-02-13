import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';

class ReloadCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['r'],
			cooldown: 0,
			description: 'Reload a command',
			examples: ['reload reload'],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.TRUSTED,
			usage: 'reload <...Command>',
		});
	}
	public parseArgs(message: Message, args: string[]): string | string[] {
		if (!args.length) return 'you should supply at least one command to reload.';

		for (const name of args) {
			const command: Command | undefined = this.handler.resolveCommand(name.toLowerCase());
			if (!command) return `could not resolve \`${name}\` to a command.`;
		}

		return args;
	}

	public async run(message: Message, commands: string[]): Promise<Message | Message[]> {
		const results = await this.reloadCommands(commands);

		let out: string = 'something went wrong.\n';
		for (const [command, { message: error }] of results) {
			out += `**${command[0].toUpperCase() + command.slice(1)}**:\n    ${error}\n`;
		}

		return message.reply(results.length ? out : 'everything reloaded successfully.');
	}

	private async reloadCommands(commands: string[]): Promise<[string, Error][]> {
		const failures: [string, Error][] = [];
		for (const command of commands) {
			try {
				await this.client.commandHandler.reloadCommand(command);
			} catch (e) {
				failures.push([command, e]);
			}
		}

		return failures;
	}
}

export { ReloadCommand as Command };
