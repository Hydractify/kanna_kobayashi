import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';
import { Emojis } from '../../types/Emojis';

class RavioliCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['praise'],
			description: 'Respect me!',
			examples: ['ravioli'],
			images: ['https://www.hydractify.org/memes/ravioli/1.png'],
			messageContent: `**Ravioli ravioli all praise the Dragon... PRAISE ME, HUMAN!** ${Emojis.KannaWow}`,
			usage: 'ravioli',
		});
	}
}

export { RavioliCommand as Command };
