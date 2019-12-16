import { Message } from 'discord.js';
import { Transaction } from 'sequelize';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { Emojis } from '../../types/Emojis';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class BreakUpCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['divorce'],
			cooldown: 1e4,
			description: 'Break up with your current partner',
			examples: ['breakup'],
			exp: 0,
			usage: 'breakup',
		});
	}

	public async run(
		message: GuildMessage,
		args: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]>
	{
		if (!authorModel.partnerId) return message.reply(`you do not have a partner! ${Emojis.KannaShy}`);
		const partnerModel: UserModel = await authorModel.$get<UserModel>('partner') as UserModel;
		if (!partnerModel) return message.reply(`you do not have a partner! ${Emojis.KannaShy}`);

		await message.reply(`are you sure you want to break up with <@${partnerModel.id}>? (**Y**es or **N**o)`);

		const collected: Message | undefined = await message.channel.awaitMessages(
			(msg: GuildMessage) => message.author.id === msg.author.id && /^(y|n|yes|no)/i.test(msg.content),
			{ time: 5e4, max: 1 },
		).then(collected => collected.first());

		if (!collected) return message.reply('aborting the command, due to lacking response.');

		if (collected.content[0].toLowerCase() !== 'y') return message.reply('aborting the command.');

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

		return message.reply(`you successfully broke up with your current partner! ${Emojis.KannaShy}`);
	}
}

export { BreakUpCommand as Command };
