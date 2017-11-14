const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase, mapIterator } = require('../../util/util');

class ModListCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['mods'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			cooldown: 5000,
			enabled: true,
			description: 'See the mod list of the guild!',
			examples: ['modlist online', 'modlist dnd'],
			exp: 0,
			name: 'modlist',
			usage: 'modlist [status]',
			permLevel: 0
		});

		this.statuses = [
			['online', '<:online:339191830140944385>'],
			['idle', '<:idle:339191829515993089>'],
			['dnd', '<:dnd:339191829524381716>'],
			['offline', '<:offline:339191829218066433>']
		];
	}

	async run(message, [input], { authorModel }) {
		const guild = message.guild.memberCount === message.guild.members.size
			? message.guild
			: await message.guild.fetchMembers();
		const guildMembers = guild.members;

		if (!input) return this.modList(message, guildMembers, authorModel);

		const statuses = [];
		for (const [status] of this.statuses) {
			statuses.push(status);
		}

		if (statuses.includes(input)) return this.presenceList(message, guildMembers, input, authorModel);

		return message.reply('that is an invalid status!');
	}

	presenceList(message, guildMembers, status, authorModel) {
		let mods = new Set();
		for (const member of guildMembers.values()) {
			if (member.user.bot) continue;
			if (!member.permissions.has(['KICK_MEMBERS', 'BAN_MEMBERS'])) continue;
			if (member.presence.status !== status) continue;
			mods.add(member.toString());
		}
		if (!mods.size) return message.reply(`there are no **${status}** mods!`);

		const embed = RichEmbed.common(message, authorModel)
			.setAuthor(`${titleCase(message.guild.name)}'s Mod List`, message.client.user.avatarURL)
			.setDescription('This list is populated with all members that can ban and kick members.')
			.addField(`${titleCase(status)} Mods`, mapIterator(mods.values()));

		return message.channel.send(embed);
	}

	modList(message, guildMembers, authorModel) {
		let mods = {
			online: new Set(),
			idle: new Set(),
			dnd: new Set(),
			offline: new Set()
		};

		for (const member of guildMembers.values()) {
			if (member.user.bot) continue;
			if (!member.permissions.has(['KICK_MEMBERS', 'BAN_MEMBERS'])) continue;
			mods[member.presence.status].add(member.toString());
		}

		const embed = RichEmbed.common(message, authorModel)
			.setAuthor(`${titleCase(message.guild.name)}'s Mod List`, message.client.user.avatarURL)
			.setDescription('This list is populated with all members that can ban and kick members.');

		for (const [status, emoji] of this.statuses) {
			if (mods[status].size) {
				embed.addField(`${titleCase(status)} ${emoji}`, mapIterator(mods[status]), true);
			}
		}

		return message.channel.send(embed);
	}
}

module.exports = ModListCommand;
