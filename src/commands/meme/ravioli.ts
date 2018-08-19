import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class RavioliMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['praise'],
			description: 'Respect me!',
			examples: ['ravioli'],
			images: ['https://thedragonproject.network/memes/ravioli/1.png'],
			messageContent: '**Ravioli ravioli all praise the Dragon... PRAISE ME HUMAN!** <:kannaWow:458777326810038292>',
			name: 'ravioli',
			usage: 'ravioli',
		});
	}
}

export { RavioliMemeCommand as Command };
