const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class ComfyMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			baseURL: 'http://kannathebot.me/memes/comfy/',
			description: 'So... soft... _falls asleep_',
			examples: ['comfy'],
			name: 'comfy',
			maxNumber: 2,
			usage: 'comfy'
		});
	}
}

module.exports = ComfyMemeCommand;
