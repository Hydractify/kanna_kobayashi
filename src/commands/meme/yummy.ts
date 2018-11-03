import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class YummyCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'The pure art of noodles',
			examples: ['yummy'],
			images: ['https://www.hydractify.org/memes/yummy/1.png'],
			usage: 'yummy',
		});
	}
}

export { YummyCommand as Command };
