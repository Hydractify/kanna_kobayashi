import { Collection, Message, Snowflake } from 'discord.js';
import { Transaction } from 'sequelize';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class BreakUpCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['divorce'],
			coins: 0,
			cooldown: 1e4,
			description: 'Break up with your current partner',
			examples: ['breakup'],
			exp: 0,
			name: 'breakup',
			usage: 'breakup',
		});
	}

	public async run(message: Message, args: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		if (!authorModel.partnerId) return message.reply('you do not have a partner!');
		const partnerModel: UserModel = await authorModel.$get<UserModel>('partner') as UserModel;
		if (!partnerModel) return message.reply('you do not have a partner!');

		await message.reply(`are you sure you want to break up with <@${partnerModel.id}>? (**Y**es or **N**o)`);

		const collected: Collection<Snowflake, Message> = await message.channel.awaitMessages(
			(msg: Message) => message.author.id === msg.author.id && /^(y|n|yes|no)/i.test(msg.content),
			{ time: 5e4, max: 1 });

		if (!collected.size) return message.reply('aborting the command, duo lacking response.');

		if (collected.first().content[0].toLowerCase() !== 'y') return message.reply('aborting the command.');

		authorModel.partnerId = null;
		authorModel.partnerMarried = null;
		authorModel.partnerSince = null;

		partnerModel.partnerId = null;
		partnerModel.partnerMarried = null;
		partnerModel.partnerSince = null;

		const transaction: Transaction = await this.sequelize.transaction();

		await Promise.all([
			authorModel.save({ transaction }),
			partnerModel.save({ transaction }),
		]);

		await transaction.commit();

		return message.reply('you successfully broke up with your current partner');
	}
}

export { BreakUpCommand as Command };
