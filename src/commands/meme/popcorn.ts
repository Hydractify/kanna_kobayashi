import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class PopcornMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['dreck'],
			description: 'Popcorn!',
			examples: ['popcorn'],
			images: ['https://thedragonproject.network/memes/popcorn/1.png'],
			name: 'popcorn',
			usage: 'popcorn',
		});
	}
}

export { PopcornMemeCommand as Command };
