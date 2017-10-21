const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class RavioliMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'Respect me!',
			examples: ['ravioli'],
			aliases: ['praise'],
			name: 'ravioli',
			usage: 'ravioli',
			messageContent: '**Ravioli ravioli all praise the Dragon... PRAISE ME HUMAN!** <:KannaOh:315264555859181568>'
		}, [
			'http://kannathebot.me/memes/ravioli/1.png'
		]);
	}
}

module.exports = RavioliMemeCommand;
