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
			"https://images-ext-2.discordapp.net/eyJ1cmwiOiJodHRwczovL2Nkbi5kaXNjb3JkYXBwLmNvbS9hdHRhY2htZW50cy8yNzUxMzU5ODA0ODExNTA5NzYvMjk5MjYzMzIyMTU3NzQ0MTI4L2FLVnZCcDFfNDYwcy5wbmcifQ.QZ7r6tUoDr0KZ_R74SJX4iIuPQM?width=388&height=597", 
			"https://cdn.discordapp.com/attachments/269129409888256000/300666636946374656/1491677914_giphy_2.gif"
		][Math.floor(Math.random() * 2)];

		const model = await message.author.fetchModel();
		return message.channel.send(RichEmbed.meme(message, model, imageLinks));
	}
}

module.exports = LoliMeme;
