import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class RainMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'Get your umbrella and lets go have fun!',
			examples: ['rain'],
			images: ['http://kannathebot.me/memes/rain/1.gif'],
			name: 'rain',
			usage: 'rain',
		});
	}
}

export { RainMemeCommand as Command };
