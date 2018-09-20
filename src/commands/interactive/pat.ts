import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { Emojis } from '../../types/Emojis';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class PatCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'patted',
			aliases: ['patto'],
			description: 'Pat someone\'s head!',
			emoji: Emojis.KannaBlush,
			examples: ['pat kanna', 'pat kanna wizard'],
			type: 'pat',
			usage: 'pat <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: `You are so cute **${message.member.displayName}**!`,
			dev: `Thanks for patting **${members.first()!.name}**!`,
			trusted: `**${members.first()!.name}** deserved it :3`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { PatCommand as Command };
