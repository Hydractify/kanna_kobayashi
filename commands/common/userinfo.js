const moment = require('moment');

const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase, mapIterator } = require('../../util/Util');

class UserInfoCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['whois', 'ust'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Display information about a specific user.',
			examples: ['userinfo @space#0302'],
			exp: 0,
			name: 'userinfo',
			usage: 'userinfo [User]'
		});
	}

	async run(message, [input], { authorModel }) {
		const user = input
			? await this.handler.resolveMember(message.guild, input)
				.then(member => member
					? member.user
					: this.handler.resolveUser(input)
				)
			: message.author;
		if (!user) return message.reply(`I could not find a user with ${input}.`);

		const member = message.guild.members.get(user.id) || await message.guild.fetchMember(user.id).catch(() => null);

		let roles = member.roles.clone();
		roles.delete(message.guild.id);
		roles = mapIterator(roles.values());

		const embed = RichEmbed.common(message, authorModel)
			.setAuthor(`Info about ${user.tag}`, user.displayAvatarURL, user.displayAvatarURL)
			.setDescription('\u200b')
			.addField('ID', user.id, true)
			.addField('Username', user.username, true);

		if (member) embed.addField('Nickname', member.nickname || 'None', true);

		embed
			.addField('Discriminator', user.discriminator, true)
			.addField('Status', titleCase((member || user).presence.status), true)
			.addField('Game', (member || user).presence.game ? (member || user).presence.game.name : 'Nothing', true)
			.addField('Shard guilds on this shard', this.client.guilds.filter(guild => guild.members.has(user.id)).size, true)
			.addField('Registered account', this._formatTimespan(user.createdTimestamp));

		if (member) {
			embed
				.addField('Joined this guild', this._formatTimespan(member.joinedAt), true)
				.addField('Roles', roles);
		}

		embed.addField('Avatar', `[Link](${user.displayAvatarURL})`)
			.setImage(user.displayAvatarURL);

		return message.channel.send(embed);
	}

	_formatTimespan(from) {
		return `${moment(from).format('MM/DD/YYYY (HH:mm)')} [${moment.duration(from - Date.now()).humanize()}]`;
	}
}

module.exports = UserInfoCommand;
