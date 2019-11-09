import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { Emojis } from '../../types/Emojis';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class DanceCommand extends WeebCommand
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			action: 'is dancing with',
			description: `Dance! ${Emojis.KannaRun}`,
			emoji: Emojis.KannaRun,
			examples: ['dance', 'dance kanna', 'dance kanna wizard'],
			type: 'dance',
			usage: 'dance [...User]',
		});
	}

	public async parseArgs(
		message: GuildMessage,
		args: string[],
	): Promise<string | [Collection<Snowflake, IWeebResolvedMember> | undefined]>
	{
		if (!args.length) return [undefined];

		const members: Collection<Snowflake, IWeebResolvedMember> = await this.resolveMembers(args, message);
		if (!members.size) return `I could not find anyone with ${args.join(' ')}`;

		return [members];
	}

	public async run(
		message: GuildMessage,
		[members]: [Collection<Snowflake, IWeebResolvedMember> | undefined],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]>
	{
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: 'Let\'s dance!',
			dev: `**${members ? members.first()!.name : undefined}**... Dance!!`,
			trusted: `Dance with us **${members ? members.first()!.name : undefined}!`,
		});

		if (!members)
		{
			const action: string = this.action.replace(' with', '');
			return message.channel.send(
				`${Emojis.KannaSad} | **${message.member.displayName}** ${action}!`,
				embed,
			);
		}

		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { DanceCommand as Command };
