import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class PatCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['patto'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Pat someone\'s head!',
			emoji: '<:KannaLewd:320406420824653825>',
			examples: ['pat kanna', 'pat kanna wizard'],
			name: 'pat',
			type: 'pat',
			usage: 'pat <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel);
		const baseString: string = this.computeBaseString(message, members, {
			action: 'patted',
			dev: `Thanks for patting **${members.first().name}**!`,
			trusted: `**${members.first().name}** deserved it :3`,
			bot: `You are so cute **${message.member.displayName}**!`,
		});

		return message.channel.send(baseString, embed);
	}
}

export { PatCommand as Command };
