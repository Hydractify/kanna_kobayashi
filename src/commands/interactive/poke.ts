import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class PokeCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'poked',
			description: 'G-get someone\'s attention!',
			emoji: '<:KannaAyy:315270615844126720>',
			examples: ['poke kanna', 'poke kanna wizard'],
			name: 'poke',
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
			dev: `Notice him **${members.first().name}**!`,
			trusted: `_stares at **${members.first().name}**_`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { PokeCommand as Command };
