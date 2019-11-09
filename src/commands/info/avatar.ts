import { GuildMember, Message, User } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class AvatarCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['av', 'image'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Take a closer look at the avatar of a user',
			examples: ['avatar @space#0302'],
			usage: 'avatar [User]',
		});
	}

	public async parseArgs(message: GuildMessage, [input]: string[]): Promise<[User] | string>
	{
		if (!input) return [message.author];

		const member: GuildMember | undefined = await this.resolver.resolveMember(input, message.guild);
		if (member) return [member.user];

		const user: User | undefined = await this.resolver.resolveUser(input);

		return user
			? [user]
			: `I could not find a user with ${input}.`;
	}

	public async run(
		message: GuildMessage,
		[user]: [User],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]>
	{
		const embed: MessageEmbed = MessageEmbed.image(message, authorModel, user.displayAvatarURL({ size: 2048 }))
			.setAuthor(`${user.tag}'s avatar`, user.displayAvatarURL(), user.displayAvatarURL());

		return message.channel.send(embed);
	}
}

export { AvatarCommand as Command };
