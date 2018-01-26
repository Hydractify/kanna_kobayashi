import { GuildMember, Message } from 'discord.js';

import { UserReputation } from '../../models/UserReputation';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { UserReputationTypes } from '../../types/UserReputationTypes';

class AddReputationCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['rep', 'addrep', '++'],
			coins: 0,
			description: 'Add a positive reputation to a member .',
			examples: ['addrep @space#0302'],
			exp: 0,
			name: 'addreputation',
			usage: 'addrep <Member>',
		});
	}

	public async parseArgs(message: Message, [target]: string[]): Promise<string | [GuildMember, UserReputation]> {
		if (!target) return 'you need to tell me who you want to add a positive reputation to.';

		const member: GuildMember = await this.resolver.resolveMember(target, message.guild, false);
		if (!member) return `I could not find a non-bot member with the name or id ${target}.`;
		if (member.id === message.author.id) return 'you can not add a reputation to yourself.';
		const already: UserReputation = await UserReputation.findOne<UserReputation>({
			where: {
				repId: member.id,
				repperId: message.author.id,
			},
		});

		if (already && already.type === UserReputationTypes.POSITIVE) {
			return `you already added a postive reputation to **${member.user.tag}**.`;
		}

		return [member, already];
	}

	public async run(message: Message, [member, already]: [GuildMember, UserReputation]): Promise<Message | Message[]> {
		if (already) {
			already.type = UserReputationTypes.POSITIVE;
			await already.save();

			return message.reply([
				'you successfully edited your reputation entry of',
				`**${member.user.tag}** to be positive.`,
			].join(' '));
		} else {
			// To ensure the user exists in the database
			await member.user.fetchModel();
		}

		await UserReputation.create({ repId: member.id, repperId: message.author.id, type: 'POSITIVE' });

		return message.reply(`you successfully added a positive reputation to **${member.user.tag}**.`);
	}
}

export { AddReputationCommand as Command };
