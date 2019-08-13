import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { PermLevels } from '../../types/PermLevels';

class LevelUpCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'Get or set whether level up message should be sent in this guild',
			examples: [
				'levelup',
				'levelup true',
				'levelup false',
			],
			guarded: true,
			permLevel: PermLevels.HUMANTAMER,
			usage: 'levelup [\'true\'|\'false\']',
		});
	}

	public parseArgs(message: GuildMessage, [state]: string[]): string | [boolean | undefined] {
		if (!state) return [undefined];
		state = state.toLowerCase();

		if (state === 'true') return [true];
		if (state === 'false') return [false];

		return `you must tell me if you want to disable or not! (\`${this.usage}\`)`;
	}

	public async run(message: GuildMessage, [state]: [boolean | undefined]): Promise<Message | Message[]> {
		if (state === undefined) {
			return message.reply(
				`level up messages are currently ${message.guild.model.levelUpEnabled ? 'enabled' : 'disabled'}.`,
			);
		}

		if (state === message.guild.model.levelUpEnabled) {
			return message.reply(
				`level up message are already ${message.guild.model.levelUpEnabled ? 'enabled' : 'disabled'}`,
			);
		}

		message.guild.model.levelUpEnabled = state;
		await message.guild.model.save();

		return message.reply(
			`you ${message.guild.model.levelUpEnabled ? 'enabled' : 'disabled'} level up message for this guild.`,
		);
	}
}

export { LevelUpCommand as Command };
