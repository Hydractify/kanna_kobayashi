import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { Emojis } from '../../types/Emojis';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class LickCommand extends WeebCommand 
{
	public constructor(handler: CommandHandler) 
	{
		super(handler, {
			action: 'licked',
			description: 'L-lick someone!',
			emoji: Emojis.KannaBlush,
			examples: ['lick kanna', 'lick kanna wizard'],
			type: 'lick',
			usage: 'lick <...User>',
		});
	}

	public async run(
		message: GuildMessage,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> 
	{
		if (members && members.size === 1) 
		{
			if (members.has(this.client.user!.id)) return message.reply('do not dare to touch that tongue on me! Hentai! ');
		}

		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: 'D-don\'t!',
			dev: `W-why are you licking **${members.first()!.name}**!?`,
			trusted: 'P-pervert!',
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { LickCommand as Command };
