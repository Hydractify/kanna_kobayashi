const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

class DanceMeme extends Command {
	constructor(handler) {
		super(handler, {
			aliases: [],
			clientPermissions: ['EMBED_LINKS'],
			coins: 10,
			cooldown: 5000,
			enabled: true,
			description: 'Watch the dragons dance!',
			examples: ['dance'],
			exp: 850,
			name: 'dance',
			usage: 'dance',
			permLevel: 0
		});
	}

	async run(message) {
		const imageLinks = [
			"http://kannathebot.me/memes/dance/1.gif", 
			"http://kannathebot.me/memes/dance/2.gif", 
			"http://kannathebot.me/memes/dance/3.gif"
		][Math.floor(Math.random() * 3)]

		const model = await message.author.fetchModel();
		return message.channel.send(RichEmbed.meme(message, model, imageLinks));
	}
}

module.exports = DanceMeme;
