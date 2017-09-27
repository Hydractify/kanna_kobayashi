const Extension = require('./Extension');

class GuildMemberExtension extends Extension {
	get permLevel() {
		if (this.user.model) {
			if (this.user.model.type === 'DEV') return 4;
			if (this.user.model.type === 'TRUSTED') return 3;
		}

		// Only compute permissions once
		const { permissions } = this;
		if (permissions.has('MANAGE_GUILD')
			|| permissions.has(['BAN_MEMBERS', 'KICK_MEMBERS'])) return 2;

		// Guild model should not be uncached, but just as fallback
		const roleName = this.guild.model ? this.guild.model.tamerRole : 'dragon tamer';
		if (this.roles.exists(role => role.name.toLowerCase() === roleName)) return 1;

		return 0;
	}
}

module.exports = GuildMemberExtension;
