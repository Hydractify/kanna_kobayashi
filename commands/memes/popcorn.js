const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class PopcornMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			examples: ['popcorn'],
			name: 'popcorn',
			usage: 'popcorn',
			description: 'Popcorn!',
			aliases: ['dreck']
		}, [
			'http://kannathebot.me/memes/popcorn/1.png'
		]);
	}
}

module.exports = PopcornMemeCommand;
