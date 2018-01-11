import { Message, User } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { Resolver } from '../../structures/Resolver';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';

class ForceBanCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['fban'],
			clientPermissions: ['BAN_MEMBERS'],
			coins: 0,
			description: 'Ban a user that is currently not in this guild!',
			examples: ['fban 218348062828003328'],
			exp: 0,
			name: 'forceban',
			permLevel: PermLevels.HUMANTAMER,
			usage: 'forceban <ID> [...Reason]',
		});
	}

	public async parseArgs(message: Message, [id, ...reason]: string[]): Promise<[User, string] | string> {
		if (!id) return 'you have to give me an id of a user to ban!';

		const match: RegExpExecArray = Resolver.idRegex.exec(id);
		if (!match) return 'supplied argument did not look like an id!';

		id = match[1] || match[2];

		const user: User = await this.client.users.fetch(id).catch(() => undefined);
		if (user) {

			if (message.guild.members.has(user.id) || await message.guild.members.fetch(user.id).catch(() => undefined)) {
				return 'that user is currently in this guild, use the regular ban command instead.';
			}

			return [user, reason.join(' ')];
		}

		return 'no user with that id exists!';
	}

	public async run(
		message: Message,
		[user, reason]: [User, string],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		await message.guild.members.ban(user, { reason });

		return message.reply(`successfully banned the user \`@${user.tag}\`!`);
	}
}

export { ForceBanCommand as Command };
