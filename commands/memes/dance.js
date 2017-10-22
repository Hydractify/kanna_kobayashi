const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class DanceMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			baseURL: 'http://kannathebot.me/memes/dance/',
			description: 'Watch the dragons dance!',
			examples: ['dance'],
			name: 'dance',
			maxNumber: 3,
			usage: 'dance'
		});
	}
}

module.exports = DanceMemeCommand;
