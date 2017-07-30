exports.start = () => {
	const { client } = require('../connections/discord');
	const info = require('../../data/client/info');
	client.perms = (message) => {
		if (info.devs.includes(message.author.id)) return 4;
		if(info.trusted.includes(message.author.id)) return 3;
		if(message.member.permissionsIn(message.channel).has(['BAN_MEMBERS', 'KICK_MEMBERS'])) return 2;
		const dragonTamer = message.guild.roles.find(role => role.name.toLowerCase() === 'dragon tamer');
		if (dragonTamer && message.member.roles.has(dragonTamer)) return 1;
		return 0;
	}
}
