const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class DoItMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'You have to do it... For me!',
			examples: ['doit'],
			images: ['http://kannathebot.me/memes/doit/1.jpg'],
			name: 'doit',
			usage: 'dance',
			messageContent: '<:KannaMad:315264558279426048> | **Do it!**'
		});
	}
}

module.exports = DoItMemeCommand;
