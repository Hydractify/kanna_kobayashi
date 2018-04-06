import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class ComfyMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			baseURL: 'https://thedragonproject.network/memes/comfy/',
			description: 'So... soft... _falls asleep_',
			examples: ['comfy'],
			maxNumber: 2,
			name: 'comfy',
			usage: 'comfy',
		});
	}
}

export { ComfyMemeCommand as Command };
