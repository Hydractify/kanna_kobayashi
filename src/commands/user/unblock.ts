import { Message, User } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class UnblockCommand extends Command {
	constructor(handler: CommandHandler) {
		super(handler, {
			description: 'Unblock a user, allowing them to use interactive commands on you again.',
			examples: ['unblock space'],
			exp: 0,
			usage: 'unblock <User>',
		});
	}

	public async parseArgs(
		message: GuildMessage,
		args: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<[User] | string> {
		if (!args.length) return 'you need to tell me who to unblock.';

		let { user }: { user?: User } = await this.resolver.resolveMember(args.join(' '), message.guild, false) || {};
		if (!user) user = await this.resolver.resolveUser(args.join(' '), false);
		if (!user) return `I could not find a non-bot user with that id or name: ${args.join(' ')}.`;

		if (!await authorModel.$has('blocked', user.id)) {
			return `you do not have ${user.tag} blocked.`;
		}

		return [user];
	}

	public async run(
		message: GuildMessage,
		[user]: [User],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		await authorModel.$remove('blocked', user.id);

		return message.reply(`successfully unblocked ${user.tag}!`);
	}
}

export { UnblockCommand as Command };
