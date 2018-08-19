import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class HighFiveCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'high-fived',
			aliases: ['high5'],
			description: 'High-five with someone! :3',
			emoji: '<:kannaHug:460080146418892800>',
			examples: ['highfive kanna', 'highfive kanna wizard'],
			name: 'highfive',
			type: 'highfive',
			usage: 'highfive <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: 'Yay! <:kannaHug:460080146418892800>',
			dev: `High-five with me **${message.author}**! <:kannaHug:460080146418892800>`,
			trusted: `High-five with me **${message.author}**! <:kannaHug:460080146418892800>`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { HighFiveCommand as Command };
