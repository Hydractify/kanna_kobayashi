import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class CuddleCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['snuggle'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Cuddle someone... <:KannaLewd:320406420824653825>',
			emoji: '<:KannaLewd:320406420824653825>',
			examples: ['cuddle kanna', 'cuddle kanna wizard'],
			name: 'cuddle',
			type: 'hug',
			usage: 'cuddle <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel, commandName }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const action: string = `${commandName}d`;
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel);
		const baseString: string = this.computeBaseString(message, members, {
			action,
			dev: `**${members.first().name}-senpai**... Y-you got ${action}!`,
			trusted: `S-so cute **${members.first().name}**`,
			bot: `T-thanks **${message.member.displayName}**`,
		});

		return message.channel.send(baseString, embed);
	}
}

export { CuddleCommand as Command };
