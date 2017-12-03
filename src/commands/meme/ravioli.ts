import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class RavioliMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'Respect me!',
			examples: ['ravioli'],
			aliases: ['praise'],
			images: ['http://kannathebot.me/memes/ravioli/1.png'],
			name: 'ravioli',
			usage: 'ravioli',
			messageContent: '**Ravioli ravioli all praise the Dragon... PRAISE ME HUMAN!** <:KannaOh:315264555859181568>',
		});
	}
}

export { RavioliMemeCommand as Command };
