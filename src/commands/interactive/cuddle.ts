import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class CuddleCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: '',
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
		this.action = `${commandName}d`;
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: `T-thanks **${message.member.displayName}**`,
			dev: `${members ? members.first().name : undefined}-senpai... Y-you got ${this.action}!`,
			trusted: `S-so cute **${members ? members.first().name : undefined}**`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { CuddleCommand as Command };
