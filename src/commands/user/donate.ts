import { GuildMember, Message, User } from 'discord.js';
import { Transaction } from 'sequelize';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class DonateCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['give', 'transfer', 'trade'],
			description: 'Give money to someone!',
			examples: ['give wizard 1000'],
			name: 'donate',
			usage: 'donate <User> <Amount>',
		});
	}

	public async parseArgs(
		message: Message,
		[input, amount]: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<string | [User, number]> {
		if (!input) return `you must give me a user! (\`${this.usage}\`)`;
		if (!amount) return `you must give me an amount! (\`${this.usage}\`)`;

		const target: User = await this.resolver.resolveMember(input, message.guild, false)
			.then((member: GuildMember) => member
				? member.user
				: this.resolver.resolveUser(input, false),
		);

		if (!target) return `I could not find a non bot user with the name or id ${input}.`;

		const targetAmount: number = parseInt(amount);
		if (isNaN(targetAmount)) return 'that does not look like a valid number!';
		if (targetAmount <= 0) return 'the amount has to be positive!';
		if (authorModel.coins < targetAmount) return 'you do not have that amount of coins!';

		return [target, targetAmount];
	}

	public async run(
		message: Message,
		[target, amount]: [User, number],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const transaction: Transaction = await this.sequelize.transaction();
		const targetModel: UserModel = await target.fetchModel();

		await Promise.all([
			authorModel.increment({ coins: -amount }, { transaction }),
			targetModel.increment({ coins: amount }, { transaction }),
		]);

		await this.redis
			.multi()
			.hincrby(`users:${message.author.id}`, 'coins', -amount)
			.hincrby(`users:${target.id}`, 'coins', amount)
			.exec();

		await transaction.commit();

		return message.reply(`You sucessfully transferred **${amount}** <:coin:330926092703498240> to **${target.tag}**!`);
	}
}

export { DonateCommand as Command };
