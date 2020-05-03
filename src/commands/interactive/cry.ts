import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { Emojis } from '../../types/Emojis';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class CryCommand extends WeebCommand
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			action: 'is upset with',
			aliases: ['sad', 'upset'],
			description: 'Show how much you are sad... `Hope you do not use this command often -Att. Wizardλ#5679`',
			emoji: Emojis.KannaSad,
			examples: ['cry', 'cry kanna', 'cry kanna wizard'],
			type: 'cry',
			usage: 'cry [...User]',
		});
	}

	public async parseArgs(
		message: GuildMessage,
		args: string[],
		commandInfo: ICommandRunInfo,
	): Promise<string | [Collection<Snowflake, IWeebResolvedMember> | undefined]>
	{
		if (!args.length) return [undefined];

		return super.parseArgs(message, args, commandInfo);

	}

	public async run(
		message: GuildMessage,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]>
	{
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: 'W-what did I do?!',
			dev: `What did you do **${members ? members.first()!.name : undefined}**!?`,
			trusted: `Why **${members ? members.first()!.name : undefined}**?`,
		});

		if (!members)
		{
			const action: string = this.action.replace(' with', '');
			return message.channel.send(
				`${this.emoji} | **${message.member.displayName}** ${action}...`,
				embed,
			);
		}

		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { CryCommand as Command };
