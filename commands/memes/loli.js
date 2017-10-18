const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

class LoliMeme extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['kanna'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 10,
			cooldown: 5000,
			enabled: true,
			description: 'Protect all the lolis!',
			examples: ['loli'],
			exp: 850,
			name: 'loli',
			usage: 'loli',
			permLevel: 0
		});
	}

	async run(message) {
		const imageLinks = [
			"http://kannathebot.me/memes/loli/1.png", 
			"http://kannathebot.me/memes/loli/2.gif"
		][Math.floor(Math.random() * 2)];

		const model = await message.author.fetchModel();
		return message.channel.send(RichEmbed.meme(message, model, imageLinks));
	}
}

module.exports = LoliMeme;
