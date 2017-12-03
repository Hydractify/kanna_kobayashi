import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class LickCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'L-lick someone!',
			emoji: '<:KannaLewd:320406420824653825>',
			examples: ['lick kanna', 'lick kanna wizard'],
			name: 'lick',
			type: 'lick',
			usage: 'lick <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel);
		const baseString: string = this.computeBaseString(message, members, {
			action: 'licked',
			dev: `W-why are you licking **${members.first().name}**?!`,
			trusted: `P-pervert!`,
			bot: `D-don't!`,
		});

		return message.channel.send(baseString, embed);
	}
}

export { LickCommand as Command };
