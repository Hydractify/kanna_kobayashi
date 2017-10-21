const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class DoItMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'You have to do it... For me!',
			examples: ['doit'],
			name: 'doit',
			usage: 'dance'
		}, [
			'http://kannathebot.me/memes/doit/1.jpg'
		]);
	}
}

module.exports = DoItMemeCommand;