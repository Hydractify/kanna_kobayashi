const moment = require('moment');

const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase, mapIterator } = require('../../util/Util');

class GuildInfoCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['gstats', 'ginfo', 'gg'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Displays information about this guild',
			examples: ['ginfo'],
			exp: 0,
			name: 'guildinfo',
			usage: 'ginfo'
		});
	}

	async run(message, __, { authorModel }) {
		const { guild } = message;
		if (guild.memberCount > guild.members.size) await guild.fetchMembers();

		let roles = guild.roles.clone();
		// Get rid of @everyone
		roles.delete(guild.id);
		roles = mapIterator(roles.values());

		const emojis = mapIterator(guild.emojis.values());

		const counts = { users: 0, bots: 0, text: 0, voice: 0 };
		for (const { user: { bot } } of guild.members.values()) {
			++counts[bot ? 'bots' : 'users'];
		}
		for (const { type } of guild.channels.values()) {
			++counts[type];
		}

		const embed = RichEmbed.common(message, authorModel)
			.setThumbnail(guild.iconURL)
			.setAuthor(`${guild.name}'s stats`, guild.iconURL)
			.setDescription('\u200b')

			.addField('Guild ID', guild.id, true)

			.addField(
				'Server region',
				titleCase(guild.region.replace(/_/g, ' ')),
				true
			)

			.addField(
				'Guild creation',
				moment(guild.createdTimestamp).format('MM/DD/YYYY [(]HH:mm[)]'),
				true
			)
			.addField('Owner', `Tag: ${guild.owner.user.tag}\nID: ${guild.owner.id}`, true)

			.addField(
				'Members',
				[
					`Total: ${guild.memberCount}`,
					`Users: ${counts.users}`,
					`Bots: ${counts.bots}`
				],
				true
			)

			.addField(
				'Channels',
				[
					`Total: ${guild.channels.size}`,
					`Text: ${counts.text}`,
					`Voice: ${counts.voice}`
				],
				true
			)

			.addField('Role count', guild.roles.size, true)
			.addField('Emoji count', guild.emojis.size, true)
			.addField('Roles', roles || 'None', true)
			.addField('Emojis', emojis || 'None', true);

		return message.channel.send(embed);
	}
}

module.exports = GuildInfoCommand;
