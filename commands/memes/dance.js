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
			"https://cdn.discordapp.com/attachments/299632702087495680/302254759773995008/tumblr_ok24wuFmmK1thzx08o1_400.gif", 
			"https://cdn.discordapp.com/attachments/303005425941479425/323283437798555658/61X2Bgk.gif", 
			"https://cdn.discordapp.com/attachments/317398861478100992/334170028561661952/2c9.gif"
		][Math.floor(Math.random() * 3)]

		const model = await message.author.fetchModel();
		return message.channel.send(RichEmbed.meme(message, model, imageLinks));
	}
}

module.exports = DanceMeme;
