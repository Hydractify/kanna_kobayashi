import { Collection,Guild, GuildMember, Message, Role, Snowflake, User } from 'discord.js';
import * as moment from 'moment';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandInfo } from '../../types/ICommandInfo';
import { mapIterable, titleCase } from '../../util/Util';

class UserInfoCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['whois', 'ust', 'uu'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Display information about a specific user.',
			examples: ['userinfo @space#0302'],
			exp: 0,
			name: 'userinfo',
			usage: 'userinfo [User]',
		});
	}

	public async parseArgs(
		message: Message,
		[input]: string[],
	): Promise<string | [User]> {
		const user: User = input
			? await this.resolver.resolveMember(input, message.guild)
				.then((m: GuildMember) => m
					? m.user
					: this.resolver.resolveUser(input),
			)
			: message.author;
		if (!user) return `I could not find a user with ${input}.`;

		return [user];
	}

	public async run(message: Message, [user]: [User], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const member: GuildMember = message.guild.members.get(user.id) ||
			await message.guild.members.fetch(user.id).catch(() => undefined);

		const roles: Collection<Snowflake, Role> = member.roles.clone();
		roles.delete(message.guild.id);
		const rolesString: string = mapIterable(roles.values());

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`Info about ${user.tag}`, user.displayAvatarURL(), user.displayAvatarURL())
			.setDescription('\u200b')
			.addField('ID', user.id, true)
			.addField('Username', user.username, true);

		if (member) embed.addField('Nickname', member.nickname || 'None', true);

		embed
			.addField('Discriminator', user.discriminator, true)
			.addField('Status', titleCase((member || user).presence.status), true)
			.addField('Game', (member || user).presence.activity ? (member || user).presence.activity.name : 'Nothing', true)
			.addField(
			'Shard guilds on this shard',
			this.client.guilds.filter((guild: Guild) => guild.members.has(user.id)).size,
			true,
		)
			.addField('Registered account', this._formatTimespan(user.createdTimestamp));

		if (member) {
			embed
				.addField('Joined this guild', this._formatTimespan(member.joinedTimestamp), true)
				.addField('Roles', roles);
		}

		embed.addField('Avatar', `[Link](${user.displayAvatarURL})`)
			.setImage(user.displayAvatarURL());

		return message.channel.send(embed);
	}

	private _formatTimespan(from: number): string {
		return `${moment(from).format('MM/DD/YYYY (HH:mm)')} [${moment.duration(from - Date.now()).humanize()}]`;
	}
}

module.exports = UserInfoCommand;
