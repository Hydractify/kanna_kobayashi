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
			coins: 0,
			description: 'All the useful links you need!',
			examples: ['info'],
			exp: 0,
			guarded: true,
			name: 'info',
			usage: 'info',
		});
	}

	public run(message: Message, _: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`${this.client.user.username} info`, this.client.user.displayAvatarURL())
			.setDescription('\u200b')
			.addField('Invite', 'http://kannathebot.me/invite', true)
			.addField('Patreon', 'http://kannathebot.me/patreon', true)
			.addField('Official Guild', 'https://discord.gg/uBdXdE9', true)
			.addField('Official Website', 'http://kannathebot.me', true)
			.setThumbnail(message.guild.iconURL());

		return message.channel.send(embed);
	}
}

export { InfoCommand as Command };
