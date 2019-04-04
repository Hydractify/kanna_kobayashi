import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { Emojis } from '../../types/Emojis';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class BangCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'shot',
			aliases: ['shoot'],
			description: 'Shoot someone who is bothering you!',
			emoji: Emojis.KannaMad,
			examples: ['shoot kanna', 'shoot kanna wizard'],
			type: 'bang',
			usage: 'shoot <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		if (members) {
			if (members.has(this.client.user!.id)) {
				return message.reply(
					`get away from me with that pistol or I will destroy you, human! ${this.emoji}`,
				);
			}
		}
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: '',
			dev: 'Master... Run!',
			trusted: `_stares at **${message.author}**_`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { BangCommand as Command };
