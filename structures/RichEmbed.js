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
}

module.exports = RichEmbed;
