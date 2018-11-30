import { GuildMember, Message } from 'discord.js';

import { UserReputation } from '../../models/UserReputation';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';

class DeleteReputationCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['delrep', 'deleterep'],
			coins: 0,
			cooldown: 0,
			description: 'Delete your reputation of a member',
			examples: ['delrep @space#0302'],
			exp: 0,
			usage: 'deleterep <Member>',
		});
	}

	public async parseArgs(message: Message, [target]: string[]): Promise<string | [GuildMember, UserReputation]> {
		if (!target) return 'you need to tell me whose reputation from yourself you want to delete.';

		const member: GuildMember | undefined = await this.resolver.resolveMember(target, message.guild, false);
		if (!member) return `I could not find a non-bot member with the name or id ${target}.`;
		if (member.id === message.author.id) {
			return 'you can not add a reputation to yourself, thus you can not delete one from yourself.';
		}
		const reputation: UserReputation | null = await UserReputation.findOne<UserReputation>({
			where: {
				repId: member.id,
				repperId: message.author.id,
			},
		});

		if (!reputation) {
			return `you never added a reputation to **${member.user.tag}**!`;
		}

		return [member, reputation];
	}

	public async run(message: Message, [member, reputation]: [GuildMember, UserReputation]): Promise<Message | Message[]> {
		await reputation.destroy();

		return message.reply(
			`you successfully deleted your ${reputation.type.toLowerCase()} reputation from **${member.user.tag}**.`,
		);
	}
}

export { DeleteReputationCommand as Command };
