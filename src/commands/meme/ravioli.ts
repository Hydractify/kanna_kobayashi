import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class RavioliCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['praise'],
			description: 'Respect me!',
			examples: ['ravioli'],
			images: ['https://thedragonproject.network/memes/ravioli/1.png'],
			messageContent: '**Ravioli ravioli all praise the Dragon... PRAISE ME HUMAN!** <:kannaWow:458777326810038292>',
			usage: 'ravioli',
		});
	}
}

export { RavioliCommand as Command };
