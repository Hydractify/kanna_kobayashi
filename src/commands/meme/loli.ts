import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';
import { Emojis } from '../../types/Emojis';

class LoliCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['kanna'],
			description: 'Protect all the lolis!',
			examples: ['loli'],
			images: [
				'https://www.hydractify.org/memes/loli/1.png',
				'https://www.hydractify.org/memes/loli/2.gif',
			],
			messageContent: `**Wooo... A human!** ${Emojis.KannaWow}`,
			usage: 'loli',
		});
	}
}

export { LoliCommand as Command };
