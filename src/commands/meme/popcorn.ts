import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class PopcornMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			examples: ['popcorn'],
			images: ['http://kannathebot.me/memes/popcorn/1.png'],
			name: 'popcorn',
			usage: 'popcorn',
			description: 'Popcorn!',
			aliases: ['dreck'],
		});
	}
}

export { PopcornMemeCommand as Command };
