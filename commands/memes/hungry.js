const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

class HungryMeme extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['food'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 10,
			cooldown: 5000,
			enabled: true,
			description: 'See Kanna satisfy her hunger! (And curiosity)',
			examples: ['hungry'],
			exp: 850,
			name: 'hungry',
			usage: 'hungry',
			permLevel: 0
		});
	}

	async run(message) {
		const imageLinks = [
			"http://kannathebot.me/memes/hungry/1.gif", 
			"http://kannathebot.me/memes/hungry/2.gif"
		][Math.floor(Math.random() * 2)];

		const model = await message.author.fetchModel();
		return message.channel.send(RichEmbed.meme(message, model, imageLinks));
	}
}

module.exports = HungryMeme;
