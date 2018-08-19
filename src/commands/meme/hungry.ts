import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class HungryMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['food'],
			description: 'See Kanna satisfy her hunger! (And curiosity)',
			examples: ['hungry'],
			images: [
				'https://thedragonproject.network/memes/hungry/1.gif',
				'https://thedragonproject.network/memes/hungry/2.gif',
				'https://thedragonproject.network/memes/hungry/3.jpg',
				'https://thedragonproject.network/memes/hungry/4.jpg',
				'https://thedragonproject.network/memes/hungry/5.jpg',
				'https://thedragonproject.network/memes/hungry/6.jpg',
				'https://thedragonproject.network/memes/hungry/7.jpg',
			],
			messageContent: '**Feed me!** <:kannaWow:458777326810038292>',
			name: 'hungry',
			usage: 'hungry',
		});
	}
}

export { HungryMemeCommand as Command };
