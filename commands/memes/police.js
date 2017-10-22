const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class PoliceMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'Pay attention on what you do! Else i am giving you to police',
			examples: ['police'],
			images: [
				'http://kannathebot.me/memes/police/1.png'
			],
			name: 'police',
			usage: 'police'
		});
	}
}

module.exports = PoliceMemeCommand;
