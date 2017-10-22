const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class DuelMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'Yu-Gi-Oh memes',
			examples: ['duel'],
			images: [
				'http://kannathebot.me/memes/duel/1.png',
				'http://kannathebot.me/memes/duel/2.png',
				'http://kannathebot.me/memes/duel/3.png',
				'http://kannathebot.me/memes/duel/4.jpg',
				'http://kannathebot.me/memes/duel/5.jpg',
				'http://kannathebot.me/memes/duel/6.jpg'
			],
			name: 'duel',
			usage: 'duel'
		});
	}
}

module.exports = DuelMemeCommand;
