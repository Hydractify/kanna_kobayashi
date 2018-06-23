import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';

class EigthBallCommand extends Command {
	private _responses: string[] = [
		'I want it too! <:KannaHug:299650645001240578>',
		'Yes <:kannaHungry:458776120092000258>',
		'No <:kannaSad:458776254666244127>',
		'do not do it! <:kannaShy:458779242696540170>',
		'why?! <:kannaScared:458776266154180609>',
		'I have to gather more information first <:kannaInteresting:458776135031980047>',
	];

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['8b'],
			description: 'Ask the famous 8 ball a question!',
			examples: ['8ball '],
			name: '8ball',
			usage: '8ball <...question>',
		});
	}

	public parseArgs(message: Message, args: string[]): string[] | string {
		if (!args.length) return 'you have to ask a question! 👀';

		return args;
	}

	public run(message: Message, options: string[]): Promise<Message | Message[]> {
		return message.reply(this._responses[Math.floor(Math.random() * this._responses.length)]);
	}
}

export { EigthBallCommand as Command };
