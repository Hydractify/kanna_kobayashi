import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';
import { Emojis } from '../../types/Emojis';

class HungryCommand extends ImageEmbedCommand 
{
	public constructor(handler: CommandHandler) 
	{
		super(handler, {
			aliases: ['food'],
			description: 'See Kanna satisfy her hunger! (And curiosity)',
			examples: ['hungry'],
			images: [
				'https://www.hydractify.org/memes/hungry/1.gif',
				'https://www.hydractify.org/memes/hungry/2.gif',
				'https://www.hydractify.org/memes/hungry/3.jpg',
				'https://www.hydractify.org/memes/hungry/4.jpg',
				'https://www.hydractify.org/memes/hungry/5.jpg',
				'https://www.hydractify.org/memes/hungry/6.jpg',
				'https://www.hydractify.org/memes/hungry/7.jpg',
			],
			messageContent: `**Feed me!** ${Emojis.KannaWow}`,
			usage: 'hungry',
		});
	}
}

export { HungryCommand as Command };
