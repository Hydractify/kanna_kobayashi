import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class SayCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['echo'],
			coins: 0,
			description: 'Let me say something',
			examples: ['say Hello world!'],
			exp: 0,
			name: 'say',
			usage: 'say <...Message>',
		});
	}

	public parseArgs(message: Message, args: string[], { commandName }: ICommandRunInfo): string | string[] {
		if (!args.length) return 'you need to give me something to say!';

		return [message.cleanContent.slice(message.cleanContent.indexOf(commandName) + commandName.length)];
	}

	public run(message: Message, [content]: string[]): Promise<Message | Message[]> {
		return message.channel.send(content);
	}
}

export { SayCommand as Command };
