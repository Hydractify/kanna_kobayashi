import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class DoItCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'You have to do it... For me!',
			examples: ['doit'],
			images: ['https://thedragonproject.network/memes/doit/1.jpg'],
			messageContent: '<:kannaMad:458776169924526093> | **Do it!**',
			usage: 'dance',
		});
	}
}

export { DoItCommand as Command };
