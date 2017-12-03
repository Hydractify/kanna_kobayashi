import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class YummyMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'The pure art of noodles',
			examples: ['yummy'],
			images: ['http://kannathebot.me/memes/yummy/1.png'],
			name: 'yummy',
			usage: 'yummy',
		});
	}
}

export { YummyMemeCommand as Command };
