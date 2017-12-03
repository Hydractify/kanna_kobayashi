import { GuildMember, Message } from 'discord.js';

import { UserReputation } from '../../models/UserReputation';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class ShowReputationCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			aliases: ['showrep'],
			coins: 0,
			cooldown: 0,
			description: 'Shows the reputation of a member.',
			examples: ['showrep @space#0302'],
			exp: 0,
			name: 'showreputation',
			usage: 'showrep <Member>',
		});
	}

	public async parseArgs(message: Message, args: string[]): Promise<string | [GuildMember, number, number]> {
		const member: GuildMember = args.length
			? await this.resolver.resolveMember(args.join(' '), message.guild, false)
			: message.member;

		if (!member) return `I could not find a non-bot member by **${args.join(' ')}**.`;

		const { POSITIVE: positive = 0, NEGATIVE: negative = 0 } = await UserReputation.count({
			where: { repId: member.id },
			attributes: ['type'],
			group: ['type'],
			// tslint:disable-next-line:no-any
		}).then((results: any) => {
			const reps: { [key: string]: number } = {};
			for (const result of results) reps[result.type] = result.count;

			return reps;
		});

		if (!positive && !negative) return `**${member.user.tag}** does not have any reputations.`;

		return [member, positive, negative];
	}

	public async run(
		message: Message,
		[member, positive, negative]: [GuildMember, number, number],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`Reputation for ${member.user.tag}`, message.client.user.displayAvatarURL());
		// One is always present here
		if (positive) embed.addField('Positive', positive, true);
		if (negative) embed.addField('Negative', negative, true);

		return message.channel.send(embed);
	}
}

export { ShowReputationCommand as Command };
