import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class DuelMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'Yu-Gi-Oh memes',
			examples: ['duel'],
			images: [
				'https://thedragonproject.network/memes/duel/1.png',
				'https://thedragonproject.network/memes/duel/2.png',
				'https://thedragonproject.network/memes/duel/3.png',
				'https://thedragonproject.network/memes/duel/4.jpg',
				'https://thedragonproject.network/memes/duel/5.jpg',
				'https://thedragonproject.network/memes/duel/6.jpg',
			],
			name: 'duel',
			usage: 'duel',
		});
	}
}

export { DuelMemeCommand as Command };
