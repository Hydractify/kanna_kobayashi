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
			"https://cdn.discordapp.com/attachments/269129409888256000/300481191151271946/giphy_9.gif", 
			"https://cdn.discordapp.com/attachments/303005425941479425/323289325921894401/f8bcdb027870ad77d2c23adf8de7ecd000728e07_hq.gif"
		][Math.floor(Math.random() * 2)];

		const model = await message.author.fetchModel();
		return message.channel.send(RichEmbed.meme(message, model, imageLinks));
	}
}

module.exports = HungryMeme;
