import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { Emojis } from '../../types/Emojis';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class SlapCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'slapped',
			description: 'Slap someone!',
			emoji: Emojis.KannaScared,
			examples: ['slap kanna', 'slap kanna wizard'],
			type: 'slap',
			usage: 'slap <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		if (members.has(this.client.user!.id)) {
			return message.reply(
				`you can not slap me! ${Emojis.KannaMad}`,
			);
		}

		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: '',
			dev: `**${message.author}**... P-please, do not hurt them!`,
			trusted: `W-what did you do to deserve that **${members.first()!.name}**!?`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { SlapCommand as Command };
