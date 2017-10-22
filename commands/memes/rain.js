const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class RainMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'Get your umbrella and lets go have fun!',
			examples: ['rain'],
			images: ['http://kannathebot.me/memes/rain/1.gif'],
			name: 'rain',
			usage: 'rain'
		});
	}
}

module.exports = RainMemeCommand;
