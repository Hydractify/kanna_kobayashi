const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class LoliMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			aliases: ['kanna'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Protect all the lolis!',
			examples: ['loli'],
			name: 'loli',
			usage: 'loli'
		}, [
			'http://kannathebot.me/memes/loli/1.png',
			'http://kannathebot.me/memes/loli/2.gif'
		]);
	}
}

module.exports = LoliMemeCommand;
