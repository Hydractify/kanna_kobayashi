const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase, mapIterator } = require('../../util/util');

class ModListCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['mods'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'See the mod list of the guild!',
			examples: ['modlist online', 'modlist dnd'],
			exp: 0,
			name: 'modlist',
			usage: 'modlist [status]'
		});

		this.statuses = new Map([
			['online', '<:online:339191830140944385>'],
			['idle', '<:idle:339191829515993089>'],
			['dnd', '<:dnd:339191829524381716>'],
			['offline', '<:offline:339191829218066433>']
		]);
	}

	async run(message, [input], { authorModel }) {
		if (message.guild.memberCount !== message.guild.members.size) await message.guild.fetchMembers();

		if (!input) return this.modList(message, message.guild.members, authorModel);

		input = input.toLowerCase();
		if (this.status.has(input)) return this.presenceList(message, message.guild.members, input, authorModel);

		return message.reply('that is not a valid status!');
	}

	presenceList(message, members, status, authorModel) {
		let mods = new Set();
		for (const member of members.values()) {
			if (member.user.bot) continue;
			if (member.presence.status !== status) continue;
			if (!member.permissions.has(['KICK_MEMBERS', 'BAN_MEMBERS'])) continue;
			mods.add(member.toString());
		}
		if (!mods.size) return message.reply(`there are no **${status}** mods!`);

		const embed = RichEmbed.common(message, authorModel)
			.setAuthor(`${titleCase(message.guild.name)}'s Mod List`, message.client.user.avatarURL)
			.setDescription('This list is populated with all members that can ban and kick members.')
			.addField(`${titleCase(status)} Mods`, mapIterator(mods.values()));

		return message.channel.send(embed);
	}

	modList(message, members, authorModel) {
		let mods = {
			online: new Set(),
			idle: new Set(),
			dnd: new Set(),
			offline: new Set()
		};

		for (const member of members.values()) {
			if (member.user.bot) continue;
			if (!member.permissions.has(['KICK_MEMBERS', 'BAN_MEMBERS'])) continue;
			mods[member.presence.status].add(member.toString());
		}

		const embed = RichEmbed.common(message, authorModel)
			.setAuthor(`${titleCase(message.guild.name)}'s Mod List`, message.client.user.avatarURL)
			.setThumbnail(message.guild.iconURL)
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
