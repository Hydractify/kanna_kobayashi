import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class DanceMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			baseURL: 'http://kannathebot.me/memes/dance/',
			description: 'Watch the dragons dance!',
			examples: ['dance'],
			maxNumber: 3,
			name: 'dance',
			usage: 'dance',
		});
	}
}

export { DanceMemeCommand as Command };
