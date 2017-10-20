const { GuildMember } = require('discord.js');

const { Extension } = require('./Extension');

class GuildMemberExtension extends Extension {
	permLevel(model) {
		if (model) {
			if (model.type === 'DEV') return 4;
			if (model.type === 'TRUSTED') return 3;
		}

		// Only compute permissions once
		const { permissions } = this;
		if (permissions.has('MANAGE_GUILD')
			|| permissions.has(['BAN_MEMBERS', 'KICK_MEMBERS'])) return 2;

		// Guild model should not be uncached, but just as fallback
		const role = this.guild.model && this.guild.model.tamerRoleId
			? this.guild.roles.get(this.guild.model.tamerRoleId)
			: this.guild.roles.find('name', 'dragon tamer');
		if (role && this.roles.has(role)) return 1;

		return 0;
	}
}

module.exports = {
	Extension: GuildMemberExtension,
	Target: GuildMember
};
