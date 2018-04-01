import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class SlapCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'slapped',
			description: 'Slap someone!',
			emoji: '<:KannaWtf:320406412133924864>',
			examples: ['slap kanna', 'slap kanna wizard'],
			name: 'slap',
			type: 'slap',
			usage: 'slap <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		if (members.has(message.client.user.id)) {
			return message.reply(
				'you can not slap me! Baka... <:FeelsKannaMan:341054171212152832>',
			);
		}

		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: '',
			dev: `**${message.author}**... P-please, do not hurt then!`,
			trusted: `W-what did you do to deserve that **${members.first().name}**!?`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { SlapCommand as Command };
