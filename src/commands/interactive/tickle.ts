import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class TickleCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Tickle someone!',
			emoji: '<:KannaAyy:315270615844126720>',
			examples: ['tickle kanna', 'tickle kanna wizard'],
			name: 'tickle',
			type: 'tickle',
			usage: 'tickle <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel);
		const baseString: string = this.computeBaseString(message, members, {
			action: 'tickled',
			bot: `P-please stop!`,
			dev: `Tickle **${members.first().name}** harder!`,
			trusted: `Poor **${members.first().name}**`,
		});

		return message.channel.send(baseString, embed);
	}
}

export { TickleCommand as Command };
