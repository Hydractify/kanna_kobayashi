import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class BlushCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'is blushing because of',
			aliases: ['embarassed'],
			description: 'S-show how embarassed you are!',
			emoji: '<:KannaAyy:315270615844126720>',
			examples: ['blush', 'blush kanna', 'blush kanna wizard'],
			name: 'blush',
			type: 'blush',
			usage: 'blush [...User]',
		});
	}

	public async parseArgs(
		message: Message,
		args: string[],
	): Promise<string | [Collection<Snowflake, IWeebResolvedMember>]> {
		if (!args.length) return [undefined];

		const members: Collection<Snowflake, IWeebResolvedMember> = await this.resolveMembers(args, message);
		if (!members.size) return `I could not find anyone with ${args.join(' ')}`;

		return [members];
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel, commandName }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		let action: string = commandName === 'embarassed'
			? this.action.replace('blushing', 'embarassed')
			: this.action;

		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: 'B-baka! I-i did not mean to... make you blush',
			dev: `${members ? members.first().name : undefined}... What did you do!?`,
			trusted: `${message.author}... Y-you b-baka!`,
		});

		if (!members) {
			action = action.replace(' because of', '');
			return message.channel.send(
				`<:FeelsKannaMan:341054171212152832> | **${message.member.displayName}** ${action}...`,
				embed,
			);
		}

		const baseString: string = this.computeBaseString(message, members, action);

		return message.channel.send(baseString, embed);
	}
}

export { BlushCommand as Command };
