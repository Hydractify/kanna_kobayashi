import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class LoliMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['kanna'],
			description: 'Protect all the lolis!',
			examples: ['loli'],
			images: [
				'http://kannathebot.me/memes/loli/1.png',
				'http://kannathebot.me/memes/loli/2.gif',
			],
			name: 'loli',
			usage: 'loli',
			messageContent: '**Wooo... A human!** <:KannaOh:315264555859181568>',
		});
	}
}

export { LoliMemeCommand as Command };
