import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';
import { Emojis } from '../../types/Emojis';

class HungryCommand extends ImageEmbedCommand {
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
			messageContent: `**Feed me!** ${Emojis.KannaWow}`,
			usage: 'hungry',
		});
	}
}

export { HungryCommand as Command };
