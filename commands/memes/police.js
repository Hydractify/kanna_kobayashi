const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class PoliceMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'Pay attention on what you do! Else i am giving you to police',
			examples: ['police'],
			name: 'police',
			usage: 'police',
		}, [
			'http://kannathebot.me/memes/police/1.png'
		]);
	}
}

module.exports = PoliceMemeCommand;