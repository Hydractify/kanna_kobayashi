import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class BoobsMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['boob'],
			baseURL: 'http://kannathebot.me/memes/boobs/',
			description: 'Dragon Size! Wait... I am not a dragon?',
			examples: ['boobs'],
			maxNumber: 4,
			name: 'boobs',
			usage: 'boobs',
		});
	}
}

export { BoobsMemeCommand as Command };
