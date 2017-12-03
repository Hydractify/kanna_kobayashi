import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class StareCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Stare at someone <:KannaMad:315264558279426048>',
			emoji: '<:KannaWtf:320406412133924864>',
			examples: ['stare kanna', 'stare kanna wizard'],
			name: 'stare',
			type: 'stare',
			usage: 'stare <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel);
		const baseString: string = this.computeBaseString(message, members, {
			action: 'is staring at',
			dev: `**${members.first().name}**... Run!`,
			trusted: `**${members.first().name}**... Run!`,
			bot: `_runs_`,
		});

		return message.channel.send(baseString, embed);
	}
}

export { StareCommand as Command };
