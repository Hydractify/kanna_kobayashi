import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { Emojis } from '../../types/Emojis';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class HugCommand extends WeebCommand 
{
	public constructor(handler: CommandHandler) 
	{
		super(handler, {
			action: 'hugged',
			aliases: ['hwug'],
			description: 'Hug someone tightly ❤',
			emoji: Emojis.KannaShy,
			examples: ['hug kanna', 'hug kanna wizard'],
			type: 'hug',
			usage: 'hug <...User>',
		});
	}

	public async run(
		message: GuildMessage,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> 
	{
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: `You are so cute **${message.member.displayName}**!`,
			dev: `Thanks for hugging **${members ? members.first()!.name : undefined}**!`,
			trusted: `**${members ? members.first()!.name : undefined}** deserved it :3`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { HugCommand as Command };
