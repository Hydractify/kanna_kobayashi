import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class RainCommand extends ImageEmbedCommand
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			description: 'Get your umbrella and lets go have fun!',
			examples: ['rain'],
			images: ['https://www.hydractify.org/memes/rain/1.gif'],
			usage: 'rain',
		});
	}
}

export { RainCommand as Command };
