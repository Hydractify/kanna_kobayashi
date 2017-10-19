const { RichEmbed: DJSRichEmbed } = require('discord.js');

class RichEmbed extends DJSRichEmbed {
	/**
	 * Builds a common RichEmbed instance from a message.
	 * This sets color and footer.
	 * @param {Message} message Message to read data from 
	 * @param {User} [model] Sequelize user model instance
	 * @return {RichEmbed}
	 * @static
	 */
	static common({ author: { displayAvatarURL, tag }, client }, model) {
		return new this()
			.setColor(client.color(model))
			.setFooter(`Requested by ${tag}`, displayAvatarURL);
	}

	/**
	 * Builds a 'meme' RichEmbed instance inherited from a common one,
	 * this just adds an image.
	 * @param {Message} message Message to read data from 
	 * @param {User} [model] Sequelize user model instance
	 * @param {string} link Image link for the image
	 * @returns {RichEmbed}
	 * @static
	 */
	static meme(message, model, link) {
		return this.common(message, model)
			.setImage(link);
	}

	/**
	 * Splits up a long string into multiple fields for this embed.
	 * @param {string} [title='\u200b'] The title of the first field
	 * @param {string} text The long string to split up
	 * @param {boolean} [inline=false] Whether the fields should be inline
	 * @returns {RichEmbed}
	 */
	splitToFields(title = '\u200b', text, inline = false) {
		const stringArray = text.match(/(.|[\r\n]){1,1024}/g);

		for (const [i, chunk] of stringArray.entries()) {
			this.addField(i ? '\u200b' : title, chunk, inline);
		}

		return this;
	}
}

module.exports = RichEmbed;
