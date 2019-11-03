import { Message, User } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class BlockCommand extends Command 
{
	constructor(handler: CommandHandler) 
	{
		super(handler, {
			description: 'Block a user, disallowing them from using any interactive commands on you.',
			examples: ['block space'],
			exp: 0,
			usage: 'block <User>',
		});
	}

	public async parseArgs(
		message: GuildMessage,
		args: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<[User] | string> 
	{
		if (!args.length) return 'you need to tell me who to block.';

		let { user }: { user?: User } = await this.resolver.resolveMember(args.join(' '), message.guild, false) || {};
		if (!user) user = await this.resolver.resolveUser(args.join(' '), false);
		if (!user) return `I could not find a non-bot user with that id or name: ${args.join(' ')}.`;

		if (await authorModel.$has('blocked', user.id)) 
		{
			return `you already blocked ${user.tag}.`;
		}

		// Force the user to be in the database.
		await user.fetchModel();

		return [user];
	}

	public async run(
		message: GuildMessage,
		[user]: [User],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> 
	{
		await authorModel.$add('blocked', user.id);

		return message.reply(`successfully blocked ${user.tag}!`);
	}
}

export { BlockCommand as Command };
