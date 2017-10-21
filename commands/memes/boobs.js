const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class BoobsMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'Dragon Size! Wait... I am not a dragon?',
			examples: ['boobs'],
			aliases: ['boob'],
			name: 'boobs',
			usage: 'boobs'
		}, 'http://kannathebot.me/memes/boobs/', 4);
	}
}

module.exports = BoobsMemeCommand;