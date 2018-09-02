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
			emoji: '<:kannaScared:458776266154180609>',
			examples: ['punch kanna', 'punch kanna wizard'],
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
				'you can not punch me! <:kannaMad:458776169924526093>',
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
