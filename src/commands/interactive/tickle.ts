import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { Emojis } from '../../types/Emojis';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class TickleCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'tickled',
			description: 'Tickle someone!',
			emoji: Emojis.KannaShy,
			examples: ['tickle kanna', 'tickle kanna wizard'],
			type: 'tickle',
			usage: 'tickle <...User>',
		});
	}

	public async run(
		message: GuildMessage,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: 'P-please stop!',
			dev: `Tickle **${members.first()!.name}** harder!`,
			trusted: `Poor **${members.first()!.name}**`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { TickleCommand as Command };
