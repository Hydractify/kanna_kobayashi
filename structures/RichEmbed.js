const { RichEmbed: DJSRichEmbed } = require('discord.js');
const UserModel = require('../models/User');

class RichEmbed extends DJSRichEmbed {
	static common({ author: {model, user}, client }) {
		if (!(model instanceof UserModel)) throw new TypeError('The author model supplied isn\'t an instaceof UserModel');

		return new this()
			.setColor(client.color(model))
			.setFooter(`Requested by ${user.tag}`, user.displayAvatarURL);
	}
}

module.exports = RichEmbed;
