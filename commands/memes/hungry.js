const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class HungryMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			aliases: ['food'],
			description: 'See Kanna satisfy her hunger! (And curiosity)',
			examples: ['hungry'],
			name: 'hungry',
			usage: 'hungry'
		}, 'http://kannathebot.me/memes/hungry/', 2);
	}
}

module.exports = HungryMemeCommand;