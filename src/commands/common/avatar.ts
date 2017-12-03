import { GuildMember, Message, User } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class AvatarCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['av'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Display the avatar of a user',
			examples: ['avatar @space#0302'],
			exp: 0,
			name: 'avatar',
			usage: 'avatar [User]',
		});
	}

	public async parseArgs(message: Message, [input]: string[]): Promise<[User] | string> {
		if (!input) return [message.author];

		let { user }: GuildMember = await this.resolver.resolveMember(input, message.guild);
		if (user) {
			return [user];
		}

		user = await this.resolver.resolveUser(input);

		return user
			? [user]
			: `I could not find a user with ${input}.`;
	}

	public async run(message: Message, [user]: [User], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const embed: MessageEmbed = MessageEmbed.image(message, authorModel, user.displayAvatarURL())
			.setAuthor(`${user.tag}'s avatar`, user.displayAvatarURL(), user.displayAvatarURL());

		return message.channel.send(embed);
	}
}

export { AvatarCommand as Command };