const Guild = require('../models/Guild');
const Extension = require('./Extension');

class GuildExtension extends Extension {
	/**
	 * Retrieves the appropriate model instance of this guild from cache or from database if not cached.
	 * @returns {Promise<Guild>} Model instance
	 */
	async fetchModel() {
		if (this.model) return this.model;
		[this.model] = await Guild.findCreateFind({ where: { id: this.id } });

		return this.model;
	}

	get isBotfarm() {
		if (this.owner && this.owner.user.model && this.owner.user.model.type === 'WHITELISTED') return false;
		if (this.memberCount <= 30) return false;

		const halfMemberCount = this.memberCount / 2;
		let botCount = 0;
		for (const { user: { bot } } of this.members.values()) {
			if (!bot) continue;
			if (++botCount > halfMemberCount) return true;
			if (botCount > 100) return true;
		}

		return false;
	}
}

module.exports = GuildExtension;
