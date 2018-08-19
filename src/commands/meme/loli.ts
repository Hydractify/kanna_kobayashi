import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class LoliMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['kanna'],
			description: 'Protect all the lolis!',
			examples: ['loli'],
			images: [
				'https://thedragonproject.network/memes/loli/1.png',
				'https://thedragonproject.network/memes/loli/2.gif',
			],
			messageContent: '**Wooo... A human!** <:kannaWow:458777326810038292>',
			name: 'loli',
			usage: 'loli',
		});
	}
}

export { LoliMemeCommand as Command };
