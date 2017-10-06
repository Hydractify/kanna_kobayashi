const { RichEmbed: DJSRichEmbed } = require('discord.js');
const UserModel = require('../models/User');

class RichEmbed extends DJSRichEmbed {
	/**
	 * Builds a common RichEmbed's instance from a message
	 * @param {Message} message Message to read data from 
	 * @return {RichEmbed}
	 * @static
	 */
	static common({ author: { displayAvatarURL, model, tag }, client }) {
		if (!(model instanceof UserModel)) {
			throw new TypeError('The model of the supplied author is not an instaceof UserModel');
		}

		return new this()
			.setColor(client.color(model))
			.setFooter(`Requested by ${tag}`, displayAvatarURL);
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
