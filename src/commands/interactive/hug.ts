import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class HugCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['hwug'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Hug someone tight ❤',
			emoji: '<:KannaAyy:315270615844126720>',
			examples: ['hug kanna', 'hug kanna wizard'],
			name: 'hug',
			type: 'hug',
			usage: 'hug <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel);
		const baseString: string = this.computeBaseString(message, members, {
			action: 'hugged',
			dev: `Thanks for hugging **${members.first().name}**!`,
			trusted: `**${members.first().name}** deserved it :3`,
			bot: `You are so cute **${message.member.displayName}**!`,
		});

		return message.channel.send(baseString, embed);
	}
}

export { HugCommand as Command };
