import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { Emojis } from '../../types/Emojis';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class PokeCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'poked',
			description: 'G-get someone\'s attention!',
			emoji: Emojis.KannaBlush,
			examples: ['poke kanna', 'poke kanna wizard'],
			type: 'poke',
			usage: 'poke <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: `W-what did I do this time **${message.member.displayName}**!`,
			dev: `Notice them **${members.first()!.name}**!`,
			trusted: `_stares at **${members.first()!.name}**_`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { PokeCommand as Command };
