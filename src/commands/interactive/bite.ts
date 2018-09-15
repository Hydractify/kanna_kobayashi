import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { Emojis } from '../../types/Emojis';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class BiteCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'bit',
			description: 'Bite someone!',
			emoji: Emojis.KannaShy,
			examples: ['bite kanna', 'bite kanna wizard'],
			type: 'bite',
			usage: 'bite <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel, commandName }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: `W-why did you bite me **${message.member.displayName}**?`,
			dev: `Why did you bite ${members.first().name}!?`,
			trusted: `${message.author}... Stop!`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { BiteCommand as Command };
