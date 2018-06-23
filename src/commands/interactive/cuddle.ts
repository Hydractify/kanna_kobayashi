import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class CuddleCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'cuddled',
			aliases: ['snuggle', 'snug'],
			description: 'Cuddle someone... <:kannaBlush:458776068279762954>',
			emoji: '<:kannaBlush:458776068279762954>',
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
		const action: string = commandName === 'cuddle' ? 'cuddled' : 'snuggled';
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: `T-thanks **${message.member.displayName}**`,
			dev: `${members ? members.first().name : undefined}-senpai... Y-you got ${action}!`,
			trusted: `S-so cute **${members ? members.first().name : undefined}**`,
		});
		const baseString: string = this.computeBaseString(
			message,
			members,
			action,
		);

		return message.channel.send(baseString, embed);
	}
}

export { CuddleCommand as Command };
