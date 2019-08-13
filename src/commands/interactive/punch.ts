import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { Emojis } from '../../types/Emojis';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class PunchCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'punched',
			description: 'Punch someone!',
			emoji: Emojis.KannaScared,
			examples: ['punch kanna', 'punch kanna wizard'],
			type: 'punch',
			usage: 'punch <...User>',
		});
	}

	public async run(
		message: GuildMessage,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		if (members.has(this.client.user!.id)) {
			return message.reply(
				`you can not punch me! ${Emojis.KannaMad}`,
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

export { PunchCommand as Command };
