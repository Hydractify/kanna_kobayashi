import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class CryCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'is upset with',
			aliases: ['sad', 'upset'],
			description: 'Show how much you are sad... `Hope you do not use this command often -Att. Wizardλ#5679`',
			emoji: '<:FeelsKannaMan:341054171212152832>',
			examples: ['cry', 'cry kanna', 'cry kanna wizard'],
			name: 'cry',
			type: 'cry',
			usage: 'cry [...User]',
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
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: 'W-what did I do?!',
			dev: `What did you do **${members ? members.first().name : undefined}**!?`,
			trusted: `Why **${members ? members.first().name : undefined}?`,
		});

		if (!members) {
			const action: string = this.action.replace(' with', '');
			return message.channel.send(
				`<:FeelsKannaMan:341054171212152832> | **${message.member.displayName}** ${action}...`,
				embed,
			);
		}

		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { CryCommand as Command };
