import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';

class EigthBallCommand extends Command {
	private _responses: string[];

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['8b'],
			description: 'Ask the famous 8 ball a question!',
			examples: ['8ball '],
			name: '8ball',
			usage: '8ball <...question>',
		});

		this._responses = [
			'I want it too! <:KannaHug:299650645001240578>',
			'aye (Yes) <:KannaLolipop:315264556282675200>',
			'aye... (No) <:FeelsKannaMan:341054171212152832>',
			'do not do it! <:KannaAyy:315270615844126720>',
			'why?! <:KannaWtf:320406412133924864>',
			'I have to gather more information first <:KannaISee:315264557843218432>',
		];
	}

	public parseArgs(message: Message, args: string[]): string[] | string {
		if (!args.length) return `you have to ask a question! 👀`;

		return args;
	}

	public run(message: Message, options: string[]): Promise<Message | Message[]> {
		return message.reply(this._responses[Math.floor(Math.random() * this._responses.length)]);
	}
}

export { EigthBallCommand as Command };
