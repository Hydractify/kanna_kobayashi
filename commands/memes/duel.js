const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class DuelMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'Yu-Gi-Oh memes',
			examples: ['duel'],
			name: 'duel',
			usage: 'duel'
		}, [
			'http://kannathebot.me/memes/duel/1.png'
		]);
	}
}

module.exports = DuelMemeCommand;