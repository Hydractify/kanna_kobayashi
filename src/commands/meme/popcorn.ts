import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class PopcornCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['dreck'],
			description: 'Popcorn!',
			examples: ['popcorn'],
			images: ['https://www.hydractify.org/memes/popcorn/1.png'],
			usage: 'popcorn',
		});
	}
}

export { PopcornCommand as Command };
