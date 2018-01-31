import { Message, User } from 'discord.js';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class BalanceCommand extends Command {
	constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['coins', 'bal'],
			coins: 0,
			description: 'See how many <:coin:330926092703498240> you have!',
			examples: ['balance', 'balance wizard'],
			exp: 0,
			name: 'balance',
			usage: 'balance [User]',
		});
	}

	public async parseArgs(
		message: Message,
		[input]: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<[UserModel, User] | UserModel[] | string> {
		if (!input) return [authorModel];

		const { user }: { user?: User } = await this.resolver.resolveMember(input, message.guild) || {};
		if (!user) return `I could not find a non bot user with the name or id ${input}`;
		const userModel: UserModel = await user.fetchModel();

		return [userModel, user];
	}

	public run(message: Message, [model, user]: [UserModel, User]): Promise<Message | Message[]> {
		if (!user) return message.reply(`you have a total of **${model.coins}** <:coin:330926092703498240>!`);

		return message.reply(`**${user.tag}** has a total of **${model.coins}** <:coin:330926092703498240>!`);
	}
}

export { BalanceCommand as Command };
