const Command = require('../../cogs/commands/framework');
const fetchM = require('../../util/fetch/members');
const common = require('../../util/embeds/common');

module.exports = class ModList extends Command {
	constructor() {
		super({
			name : 'modlist',
			alias : ['mods'],
			enabled : true	});	}

	async run(message, color) {
		const guild = await fetchM(message);
		const mods = guild.members.filter(m => m.permissions.has(['KICK_MEMBERS', 'BAN_MEMBERS']) && !m.user.bot);

		const online = [];
		const idle = [];
		const dnd = [];
		const offline = [];
		for (const mod of mods.values()) {
			if (mod.user.presence.status === 'online') online.push(mod.user.tag);
			if (mod.user.presence.status === 'idle') idle.push(mod.user.tag);
			if (mod.user.presence.status === 'dnd') dnd.push(mod.user.tag);
			if (mod.user.presence.status === 'offline') offline.push(mod.user.tag);
		}

		const embed = common(color, message)
		.setAuthor(`${guild.name} Mod List`, guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png')
		.setDescription('\u200b')
		.setThumbnail(guild.iconURL || 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png')
		.addField('Online <:online:339191830140944385>', '**' + (online.join('**\n**') || 'None') + '**', true)
		.addField('Idle <:idle:339191829515993089>', '**' + (idle.join('**\n**') || 'None') + '**', true)
		.addField('Do not Disturb <:dnd:339191829524381716>', '**' + (dnd.join('**\n**') || 'None') + '**', true)
		.addField('Offline/Invisible <:offline:339191829218066433>', '**' + (offline.join('**\n**') || 'None') + '**', true);

		await message.channel.send({embed});
	}
}
