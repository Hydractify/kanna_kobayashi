const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class YummyMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'The pure art of noodles',
			examples: ['yummy'],
			images: ['http://kannathebot.me/memes/yummy/1.png'],
			name: 'yummy',
			usage: 'yummy'
		});
	}
}

module.exports = YummyMemeCommand;
