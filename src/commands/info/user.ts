import { Guild, GuildMember, Message, Role, Snowflake, User } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { mapIterable, TimestampFlag, timestampMarkdown } from '../../util/Util';

class UserInfoCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['whois', 'uu', 'uinfo'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Display information about a specific user',
			examples: ['userinfo @space#0302'],
			usage: 'userinfo [User]',
		});
	}

	public async parseArgs(
		message: GuildMessage,
		[input]: string[],
	): Promise<string | [User]>
	{
		const user: User | undefined = input
			? await this.resolver.resolveMember(input, message.guild)
				.then((m: GuildMember | undefined) => m ? m.user : this.resolver.resolveUser(input))
			: message.author;
		if (!user) return `I could not find a user with ${input}.`;

		return [user];
	}

	public async run(
		message: GuildMessage,
		[user]: [User],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]>
	{
		const member: GuildMember | undefined = message.guild.members.cache.get(user.id) ||
			await message.guild.members.fetch(user.id).catch(() => undefined);

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`Info about ${user.tag}`, user.displayAvatarURL(), user.displayAvatarURL())
			.setDescription('\u200b')
			.addField('ID', user.id, true)
			.addField('Username', user.username, true);

		if (member) embed.addField('Nickname', member.nickname || 'None', true);

		embed
			.addField('Discriminator', user.discriminator, true)
			.addField(
				'Shared guilds on this shard',
				this.client.guilds.cache.filter((guild: Guild) => guild.members.cache.has(user.id)).size,
				true,
			)
			.addField('Registered account', timestampMarkdown(user.createdTimestamp, TimestampFlag.RelativeTime));

		if (member)
		{
			const roles: Map<Snowflake, Role> = new Map(member.roles.cache.entries());
			roles.delete(message.guild.id);
			const rolesString: string = mapIterable(roles.values());

			embed
				.addField('Joined this guild', timestampMarkdown(member.joinedTimestamp ?? 0, TimestampFlag.RelativeTime), true)
				.addField('Roles', rolesString || 'None');
		}

		embed.addField('Avatar', `[Link](${user.displayAvatarURL()})`)
			.setImage(user.displayAvatarURL());

		return message.channel.send(embed);
	}
}

export { UserInfoCommand as Command };
