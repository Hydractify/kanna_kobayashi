import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class SleepCommand extends ImageEmbedCommand
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['bosssleeppls'],
			description: 'It is time to sleep!',
			examples: ['sleep'],
			images: [
				'https://www.hydractify.org/memes/sleep/1.png',
				'https://www.hydractify.org/memes/sleep/2.jpg',
				'https://www.hydractify.org/memes/sleep/3.jpg',
				'https://www.hydractify.org/memes/sleep/4.jpg',
				'https://www.hydractify.org/memes/sleep/5.jpg',
				'https://www.hydractify.org/memes/sleep/6.jpg',
			],
			usage: 'sleep',
		});
	}
}

export { SleepCommand as Command };
