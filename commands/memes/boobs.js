const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class BoobsMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			baseURL: 'http://kannathebot.me/memes/boobs/',
			description: 'Dragon Size! Wait... I am not a dragon?',
			examples: ['boobs'],
			aliases: ['boob'],
			name: 'boobs',
			maxNumber: 4,
			usage: 'boobs'
		});
	}
}

module.exports = BoobsMemeCommand;
