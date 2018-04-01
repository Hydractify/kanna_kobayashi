import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class PunchCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'punched',
			description: 'Punch someone!',
			emoji: '<:KannaWtf:320406412133924864>',
			examples: ['punch kanna', 'punch kanna wizard'],
			name: 'punch',
			type: 'punch',
			usage: 'punch <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		if (members.has(message.client.user.id)) {
			return message.reply(
				'you can not punch me! Baka... <:FeelsKannaMan:341054171212152832>',
			);
		}

		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: '',
			dev: `**${message.author}**... P-please, do not hurt them!`,
			trusted: `W-what did you do to deserve that **${members.first().name}**!?`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { PunchCommand as Command };
