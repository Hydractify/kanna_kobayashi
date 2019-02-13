import { Message } from 'discord.js';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class InfoCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['invite', 'patreon', 'guild', 'ghearts'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'All the useful links you need!',
			examples: ['info'],
			exp: 0,
			guarded: true,
			usage: 'info',
		});
	}

	public run(message: Message, _: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`${this.client.user!.username} Information`, this.client.user!.displayAvatarURL())
			.setDescription([
				'[Invite Link](https://www.hydractify.org/invite)',
				'[Patreon](https://www.patreon.com/hydractify)',
				'[Support Server / Official Server](https://discord.gg/uBdXdE9)',
				'[Official Weebsite](https://www.hydractify.org)',
				'[Wiki / Kanna 101](https://github.com/hydractify/kanna-kobayashi/wiki)',
			].join('\n'))
			.setThumbnail(message.guild.iconURL());

		return message.channel.send(embed);
	}
}

export { InfoCommand as Command };
