const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class RainMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'Get your umbrella and lets go have fun!',
			examples: ['rain'],
			name: 'rain',
			usage: 'rain'
		}, 'htpp://kannathebot.me/memes/rain/', 1);
	}
}

module.exports = RainMemeCommand;