import { Message } from 'discord.js';

import { Client } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { IPlainError } from '../../types/IPlainError';
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
		const results: [number, [string, IPlainError][]][] = await this.client.shard
			.broadcastEval(this.reloadCommands, commands);

		const errorMap = new Map<string, string[]>();

		for (const [id, errors] of results) {
			for (const [command, { message: error }] of errors) {
				const alr = errorMap.get(command);
				if (alr) alr.push(`${id} - ${error}`);
				else errorMap.set(command, [`${id} - ${error}`]);
			}
		}

		let out: string = 'something went wrong.\n';

		for (const [command, errors] of errorMap) {
			out += `**${command[0].toUpperCase() + command.slice(1)}**:\n    ${errors.join('    \n')}\n`;
		}

		return message.reply(errorMap.size ? out : 'everything reloaded successfully.');
	}

	private async reloadCommands(client: Client, commands: string[]): Promise<[number, [string, IPlainError][]]> {
		const failures: [string, IPlainError][] = [];
		for (const command of commands) {
			try {
				await client.commandHandler.reloadCommand(command);
			} catch (e) {
				failures.push([command, require('discord.js').Util.makePlainError(e) as IPlainError])
			}
		}

		return [client.shard.id, failures];
	}
}

export { ReloadCommand as Command };
