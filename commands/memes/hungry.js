const ImageEmbedCommand = require('../../structures/ImageEmbedCommand');

class HungryMemeCommand extends ImageEmbedCommand {
	constructor(handler) {
		super(handler, {
			aliases: ['food'],
			description: 'See Kanna satisfy her hunger! (And curiosity)',
			examples: ['hungry'],
			name: 'hungry',
			usage: 'hungry',
			messageContent: '**Feed me!** <:KannaOh:315264555859181568>'
		}, [
			'http://kannathebot.me/memes/hungry/1.gif',
			'http://kannathebot.me/memes/hungry/2.gif',
			'http://kannathebot.me/memes/hungry/3.jpg',
			'http://kannathebot.me/memes/hungry/4.jpg',
			'http://kannathebot.me/memes/hungry/5.jpg',
			'http://kannathebot.me/memes/hungry/6.jpg',
			'http://kannathebot.me/memes/hungry/7.jpg'
		]);
	}
}

module.exports = HungryMemeCommand;
