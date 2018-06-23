import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';

class PingCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			coins: 0,
			description: 'See how long I need to see your message and send a response',
			examples: ['ping'],
			exp: 0,
			name: 'ping',
			usage: 'ping',
		});
	}

	public async run(message: Message): Promise<Message> {
		const sent: Message = await message.channel.send(
			'Searching for insects... <:kannaInteresting:458776135031980047>',
		) as Message;

		return sent.edit([
			`It took me **${sent.createdTimestamp - message.createdTimestamp}ms** to find and eat all insects!`,
			` <:kannaWow:458777326810038292> ~~**(WS: ${Math.floor(this.client.ping)}ms)**~~`,
		]);
	}
}

export { PingCommand as Command };
