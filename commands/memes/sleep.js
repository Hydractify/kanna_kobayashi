const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class SleepMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			description: 'It is time to sleep!',
			examples: ['sleep'],
			images: [
				'http://kannathebot.me/memes/sleep/1.png',
				'http://kannathebot.me/memes/sleep/2.jpg',
				'http://kannathebot.me/memes/sleep/3.jpg',
				'http://kannathebot.me/memes/sleep/4.jpg',
				'http://kannathebot.me/memes/sleep/5.jpg',
				'http://kannathebot.me/memes/sleep/6.jpg'
			],
			name: 'sleep',
			usage: 'sleep',
			aliases: ['bosssleeppls']
		});
	}
}

module.exports = SleepMemeCommand;
