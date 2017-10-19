const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class DanceMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Watch the dragons dance!',
			examples: ['dance'],
			name: 'dance',
			usage: 'dance'
		}, 'http://kannathebot.me/memes/dance/', 3);
	}
}

module.exports = DanceMemeCommand;