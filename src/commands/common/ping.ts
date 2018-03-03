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
			'Searching for insects... <:KannaISee:315264557843218432>',
		) as Message;

		return sent.edit([
			`It took me **${sent.createdTimestamp - message.createdTimestamp}ms** to find and eat all insects!`,
			` <:KannaOh:315264555859181568> ~~**(WS: ${Math.floor(this.client.ping)}ms)**~~`,
		]);
	}
}

export { PingCommand as Command };
