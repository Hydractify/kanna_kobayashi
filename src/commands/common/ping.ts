import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';

class PingCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'See how long I need to see your message and send a response',
			examples: ['ping'],
			usage: 'ping',
		});
	}

	public async run(message: Message): Promise<Message> {
		const sent: Message = await message.channel.send(
			'Searching for insects... <:kannaDetective:460201630026170368>',
		) as Message;

		return sent.edit([
			`It took me **${sent.createdTimestamp - message.createdTimestamp}ms** to find and eat all insects!`,
			` ~~**\`(WS: ${Math.floor(this.client.ping)}ms)\`**~~ <:kannaHungry:458776120092000258>`,
		]);
	}
}

export { PingCommand as Command };
