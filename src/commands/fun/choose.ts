import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';

class ChooseCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['choice'],
			description: 'Let me choose between things',
			examples: [
				'choose Tohru | Me', 'choose Tohru Kanna',
				'choose Tohru or Me',
				'choose Tohru, Me, or Kobayashi-san',
			],
			usage: 'choose <...Choices>',
		});
	}

	public parseArgs(message: GuildMessage, args: string[]): string[] | string
	{
		if (!args.length) return `you have to give me something to choose from! (\`${this.usage}\`)`;

		const joined: string = args.join(' ');
		// Match separated pipes, `or` as a word, or a comma after a word followed by space (surrouned by whitespace)
		const regex: RegExp = /\s*(?: \| |\bor\b|\b,)\s*/ig;
		const options: string[] = regex.test(joined)
			? joined.split(regex).filter(e => e)
			: args;

		if (!options.length) return `you have to give me something to choose from! (\`${this.usage}\`)`;
		if (options.length === 1) return 'you should at least give me two options to choose from!';

		return options;
	}

	public run(message: GuildMessage, options: string[]): Promise<Message | Message[]>
	{
		return message.reply(`I chose **${options[Math.floor(Math.random() * options.length)]}**!`);
	}
}

export { ChooseCommand as Command };
