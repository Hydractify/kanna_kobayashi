const { RichEmbed: DJSRichEmbed } = require('discord.js');

class RichEmbed extends DJSRichEmbed {
	static common({ author, client }) {
		if (!author.model) throw new Error('The model of the author of the supplied message is not cached!');

		return new this()
			.setColor(client.color(author.model))
			.setFooter(`Requested by ${author.tag}`, author.displayAvatarURL);
	}
}

module.exports = RichEmbed;
