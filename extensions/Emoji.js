const { Emoji } = require('discord.js');

const { Extension } = require('./Extension');

class EmojiExtension extends Extension {
	toJSON() {
		return {
			id: this.id,
			name: this.name,
			// eslint-disable-next-line camelcase
			require_colons: this.requiresColons,
			managed: this.managed,
			roles: this._roles
		};
	}
}

module.exports = {
	Extension: EmojiExtension,
	Target: Emoji
};
