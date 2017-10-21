const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class LoliMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			aliases: ['kanna'],
			description: 'Protect all the lolis!',
			examples: ['loli'],
			name: 'loli',
			usage: 'loli',
			messageContent: '**Wooo... A human!** <:KannaOh:315264555859181568>'
		}, [
			'http://kannathebot.me/memes/loli/1.png',
			'http://kannathebot.me/memes/loli/2.gif'
		]);
	}
}

module.exports = LoliMemeCommand;
