import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { Emojis } from '../../types/Emojis';

class EightballCommand extends Command {
	private _responses: string[] = [
		`'I want it too! ${Emojis.KannaHug}`,
		`aye! ${Emojis.KannaHungry}`,
		`no... ${Emojis.KannaSad}`,
		`do not do it! ${Emojis.KannaShy}`,
		`why?! ${Emojis.KannaScared}`,
		`I have to gather more information first ${Emojis.KannaDetective}`,
	];

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['8b', '8ball'],
			description: 'Ask the famous 8 ball a question!',
			examples: ['8ball '],
			usage: '8ball <...question>',
		});
	}

	public parseArgs(message: Message, args: string[]): string[] | string {
		if (!args.length) return `you have to ask a question! ${Emojis.KannaDetective}`;

		return args;
	}

	public run(message: Message, options: string[]): Promise<Message | Message[]> {
		return message.reply(this._responses[Math.floor(Math.random() * this._responses.length)]);
	}
}

export { EightballCommand as Command };
