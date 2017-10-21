const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class ComfyMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'So... soft... _falls asleep_',
			examples: ['comfy'],
			name: 'comfy',
			usage: 'comfy'
		}, 'http://kannathebot.me/memes/comfy/', 2);
	}
}

module.exports = ComfyMemeCommand;