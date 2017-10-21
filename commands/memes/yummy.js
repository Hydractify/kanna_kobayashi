const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class YummyMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'The pure art of noodles',
			examples: ['yummy'],
			name: 'yummy',
			usage: 'yummy'
		}, [
			'http://kannathebot.me/memes/yummy/1.png'
		]);
	}
}

module.exports = YummyMemeCommand;
