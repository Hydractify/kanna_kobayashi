import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class DoItMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'You have to do it... For me!',
			examples: ['doit'],
			images: ['http://kannathebot.me/memes/doit/1.jpg'],
			messageContent: '<:KannaMad:315264558279426048> | **Do it!**',
			name: 'doit',
			usage: 'dance',
		});
	}
}

export { DoItMemeCommand as Command };
