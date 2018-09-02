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
			guarded: true,
			name: 'reload',
			permLevel: PermLevels.TRUSTED,
			usage: 'You should know how to use this.',
		});
	}
	public parseArgs(message: Message, args: string[]): string | string[] {
		if (!args.length) return 'you should supply a command to reload.';

		return args;
	}

	public async run(message: Message, [commandName]: string[]): Promise<Message | Message[]> {
		if (!commandName) return message.reply('you should supply a command to reload.');

		const results: [number, IPlainError | undefined][] = await this.client.shard.broadcastEval(
			// tslint:disable-next-line:no-shadowed-variable
			(client: Client, [commandName]: string[]) =>
				client.commandHandler.reloadCommand(commandName)
					.then(() =>
						([client.shard.id, undefined]),
				).catch((e: IPlainError) =>
					([client.shard.id, require('discord.js').Util.makePlainError(e)]),
				),
			[commandName],
		) as any;

		return message.channel.send(results.map(
			([id, error]: [number, IPlainError | undefined]) =>
				`Shard: ${id} - ${error ? `\`${error.message}\`` : 'Success'}`,
		).join('\n'));
	}
}

export { ReloadCommand as Command };
