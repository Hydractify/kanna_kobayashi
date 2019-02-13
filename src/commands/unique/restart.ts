import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';

class RestartCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'Restarts Kanna!',
			examples: ['restart'],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.TRUSTED,
			usage: 'restart',
		});
	}

	public async run(message: Message, _: string[]): Promise<Message | Message[]> {
		await message.reply('Restarting!');
		return process.exit();
	}
}

export { RestartCommand as Command };
