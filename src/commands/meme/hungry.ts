import { CommandHandler } from '../../structures/CommandHandler';
import { ImageEmbedCommand } from '../../structures/ImageEmbedCommand';

class HungryMemeCommand extends ImageEmbedCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['food'],
			description: 'See Kanna satisfy her hunger! (And curiosity)',
			examples: ['hungry'],
			images: [
				'http://kannathebot.me/memes/hungry/1.gif',
				'http://kannathebot.me/memes/hungry/2.gif',
				'http://kannathebot.me/memes/hungry/3.jpg',
				'http://kannathebot.me/memes/hungry/4.jpg',
				'http://kannathebot.me/memes/hungry/5.jpg',
				'http://kannathebot.me/memes/hungry/6.jpg',
				'http://kannathebot.me/memes/hungry/7.jpg',
			],
			messageContent: '**Feed me!** <:KannaOh:315264555859181568>',
			name: 'hungry',
			usage: 'hungry',
		});
	}
}

export { HungryMemeCommand as Command };
