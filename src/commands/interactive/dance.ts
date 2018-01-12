import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class DanceCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'is dancing with',
			clientPermissions: ['EMBED_LINKS'],
			description: 'Dance! <:Awuu:389233504996556802>',
			emoji: '<:Awuu:389233504996556802>',
			examples: ['dance', 'dance kanna', 'dance kanna wizard'],
			name: 'dance',
			type: 'dance',
			usage: 'dance [...User]',
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
			bot: 'Let\'s dance!',
			dev: `**${members ? members.first().name : undefined}**... Dance!!`,
			trusted: `Dance with us **${members ? members.first().name : undefined}!`,
		});

		if (!members) {
			const action: string = this.action.replace(' with', '');
			return message.channel.send(
				`<:FeelsKannaMan:341054171212152832> | **${message.member.displayName}** ${action}!`,
				embed,
			);
		}

		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}
}

export { DanceCommand as Command };
