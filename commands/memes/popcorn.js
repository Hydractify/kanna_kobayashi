const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class PopcornMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			examples: ['popcorn'],
			images: ['http://kannathebot.me/memes/popcorn/1.png'],
			name: 'popcorn',
			usage: 'popcorn',
			description: 'Popcorn!',
			aliases: ['dreck']
		});
	}
}

module.exports = PopcornMemeCommand;
