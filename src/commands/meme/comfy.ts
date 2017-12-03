import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class ComfyMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			baseURL: 'http://kannathebot.me/memes/comfy/',
			description: 'So... soft... _falls asleep_',
			examples: ['comfy'],
			name: 'comfy',
			maxNumber: 2,
			usage: 'comfy',
		});
	}
}

export { ComfyMemeCommand as Command };
