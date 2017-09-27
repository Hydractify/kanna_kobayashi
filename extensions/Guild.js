const Extension = require('./Extension');

class GuildExtension extends Extension {
	get isBotfarm() {
		if (this.owner && this.owner.user.model && this.owner.user.model.type === 'WHITELISTED') return false;
		if (this.memberCount <= 50) return false;

		const halfMemberCount = this.memberCount / 2;
		let botCount = 0;
		for (const { user: { bot } } of this.members.values()) {
			if (!bot) continue;
			if (++botCount > halfMemberCount) return true;
		}

		return false;
	}
}

module.exports = GuildExtension;
