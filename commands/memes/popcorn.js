const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class PopcornMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			examples: ['popcorn'],
			name: 'popcorn',
			usage: 'popcorn'
		}, [
			'http://kannathebot.me/memes/kanna-popcorn.png'
		]);
	}
}

module.exports = PopcornMemeCommand;