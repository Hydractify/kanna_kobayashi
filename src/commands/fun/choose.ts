import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';

class ChooseCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['choice'],
			description: 'Let the bot choose one of the supplied options.',
			examples: ['choose Tohru|Kanna', 'choose Tohru Kanna'],
			name: 'choose',
			usage: 'choose <...Choices>',
		});
	}

	public parseArgs(message: Message, args: string[]): string[] | string {
		if (!args.length) return `you have to give me something to choose from! (\`${this.usage}\`)`;

		const joined: string = args.join(' ');
		const options: string[] = joined.includes('|')
			? joined.split('|')
			: args;

		if (!options.length) return `you have to give me something to choose from! (\`${this.usage}\`)`;
		if (options.length === 1) return `you should at least give me two options to choose from!`;

		return options;
	}

	public run(message: Message, options: string[]): Promise<Message | Message[]> {
		return message.reply(`I chose **${options[Math.floor(Math.random() * options.length)]}**!`);
	}
}

export { ChooseCommand as Command };
