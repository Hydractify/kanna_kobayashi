import { Collection, Message, Snowflake } from 'discord.js';

import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class CryCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['sad', 'upset'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Show how much you are sad... `Hope you do not use this command often -Att. Wizardλ#5679`',
			emoji: '<:FeelsKannaMan:341054171212152832>',
			examples: ['cry kanna', 'cry kanna wizard'],
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
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel);
		const action: string = commandName === 'upset' ? commandName : this.name;

		if (!members) {
			return message.channel.send(
				`<:FeelsKannaMan:341054171212152832> | **${message.member.displayName}** is ${action}...`,
				embed,
			);
		}

		const baseString: string = this.computeBaseString(message, members, {
			action: `is ${action} with`,
			dev: `What did you do **${members.first().name}**?!`,
			trusted: `Why **${members.first().name}?`,
			bot: `W-what did i do?!`,
		});

		return message.channel.send(baseString, embed);
	}
}

export { CryCommand as Command };
