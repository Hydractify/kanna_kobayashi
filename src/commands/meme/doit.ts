import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';
import { Emojis } from '../../types/Emojis';

class DoItCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'You have to do it... For me!',
			examples: ['doit'],
			images: ['https://www.hydractify.org/memes/doit/1.jpg'],
			messageContent: `${Emojis.KannaMad} | **Do it!**`,
			usage: 'dance',
		});
	}
}

export { DoItCommand as Command };
