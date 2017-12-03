import { Message, Util } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { IPlainError } from '../../types/IPlainError';
import { PermLevels } from '../../types/PermLevels';

class ReloadCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['r'],
			coins: 0,
			cooldown: 0,
			description: 'Reloads a command',
			examples: ['You should know how to use this.'],
			exp: 0,
			name: 'reload',
			usage: 'You should know how to use this.',
			permLevel: PermLevels.DEV,
		});
	}
	public parseArgs(message: Message, args: string[]): string | string[] {
		if (!args.length) return 'you should supply a command to reload.';

		return args;
	}

	/**
	 * Reloads a command by name or alias
	 * @param commandName Name or alias of the command to reload
	 * @returns Shard ID and false for not found, true for success
	 * and error for error
	 */
	public reload(commandName: string): [number, boolean | IPlainError] {
		const command: Command = this.handler.resolveCommand(commandName.toLowerCase());

		if (!command) return [this.client.shard.id, false];

		try {
			command.reload();
		} catch (error) {
			return [this.client.shard.id, Util.makePlainError(error)];
		}

		return [this.client.shard.id, true];
	}

	public async run(message: Message, [commandName]: string[]): Promise<Message | Message[]> {
		if (!commandName) return message.reply('you should supply a command to reload.');

		const results: string[] = await this.client.shard.broadcastEval(`this.commandHandler.reload('${commandName}')`)
			.then((result: [number, boolean | IPlainError][]) =>
				result.map(
					([id, other]: [number, boolean | IPlainError]) =>
						`Shard: ${id} - ${typeof other === 'boolean' ? other ? 'Success' : 'Not found' : `\`${other.message}\``}`,
				),
		);

		return message.channel.send(results.join('\n'));
	}
}

export { ReloadCommand as Command };
