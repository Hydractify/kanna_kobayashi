import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class BoobsMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			baseURL: 'http://kannathebot.me/memes/boobs/',
			description: 'Dragon Size! Wait... I am not a dragon?',
			examples: ['boobs'],
			aliases: ['boob'],
			name: 'boobs',
			maxNumber: 4,
			usage: 'boobs',
		});
	}
}

export { BoobsMemeCommand as Command };
