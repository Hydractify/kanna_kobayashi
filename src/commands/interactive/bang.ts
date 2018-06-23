import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class BangCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'shot',
			aliases: ['bang'],
			description: 'Shoot someone who is bothering you!',
			emoji: '<:kannaMad:458776169924526093>',
			examples: ['shoot kanna', 'shoot kanna wizard'],
			name: 'shoot',
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
			if (members.has(message.client.user.id)) {
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
