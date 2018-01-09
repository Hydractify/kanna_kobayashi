import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class RavioliMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['praise'],
			description: 'Respect me!',
			examples: ['ravioli'],
			images: ['http://kannathebot.me/memes/ravioli/1.png'],
			messageContent: '**Ravioli ravioli all praise the Dragon... PRAISE ME HUMAN!** <:KannaOh:315264555859181568>',
			name: 'ravioli',
			usage: 'ravioli',
		});
	}
}

export { RavioliMemeCommand as Command };
