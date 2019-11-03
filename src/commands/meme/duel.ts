import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class DuelCommand extends ImageEmbedCommand 
{
	public constructor(handler: CommandHandler) 
	{
		super(handler, {
			description: 'Yu-Gi-Oh memes',
			examples: ['duel'],
			images: [
				'https://www.hydractify.org/memes/duel/1.png',
				'https://www.hydractify.org/memes/duel/2.png',
				'https://www.hydractify.org/memes/duel/3.png',
				'https://www.hydractify.org/memes/duel/4.jpg',
				'https://www.hydractify.org/memes/duel/5.jpg',
				'https://www.hydractify.org/memes/duel/6.jpg',
			],
			usage: 'duel',
		});
	}
}

export { DuelCommand as Command };
