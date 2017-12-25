import { Collection, CollectorFilter, Message, Snowflake, User } from 'discord.js';
import { Sequelize, Transaction } from 'sequelize';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { Sequelize as SequelizeDecorator } from '../../util/SequelizeDecorator';

@SequelizeDecorator
class ProposeCommand extends Command {
	private sequelize: Sequelize;

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['marry'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			cooldown: 1e4,
			description: 'Propose to someone... You love! <:KannaAyy:315270615844126720>',
			examples: ['propose Wizard'],
			exp: 0,
			name: 'propose',
			usage: 'propose <User>',
		});
	}

	public async parseArgs(
		message: Message,
		[input]: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<string | [User]> {
		if (!input) return `you are missing someone to propose to! (\`${this.usage}\`)`;
		const user: User = await this.resolver.resolveUser(input, false);
		if (!user) return `I could not find a non-bot user with the name or id ${input}`;
		if (message.author.id === user.id) return 'you can not propose to yourself.';

		return [user];
	}

	public async run(message: Message, [user]: [User], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {

		const checked: boolean = await this.relationCheck(message, user, authorModel);

		if (!checked) return undefined;
		const targetModel: UserModel = await user.fetchModel();

		return this.relationStart(message, user, authorModel, targetModel);
	}

	/**
	 * Verify that the mentioned user is the current partner or no parter is currently present at all.
	 * If the mentioned user differs ask to break up.
	 * Returns whether to start a new relationship with the mentioned user.
	 * @param message Incoming message
	 * @param mentionedUser Mentioned user
	 * @param authorModel Database model for the author of the message
	 */
	private async relationCheck(message: Message, mentionedUser: User, authorModel: UserModel): Promise<boolean> {
		const partner: UserModel = await authorModel.$get<UserModel>('partner') as UserModel;

		// No partner present, green light for a new one
		if (!partner) return true;

		// Mentioned user is not the current user
		if (partner.id !== mentionedUser.id) {
			await message.reply(
				'are you sure you want to break with you current partner? (**Y**es or **N**o) <:KannaWtf:320406412133924864>',
			);

			const breakUpFilter: CollectorFilter = (msg: Message): boolean => msg.author.id === mentionedUser.id
				&& /^(y|n|yes|no)/i.test(msg.content);

			const breakUpConfirmation: Message = await message.channel.awaitMessages(breakUpFilter, { time: 10000, max: 1 })
				.then((collected: Collection<Snowflake, Message>) => collected.first());

			if (!breakUpConfirmation) {
				await message.channel.send([
					`${message.author}... as you did not tell me yes or no,`,
					'I had to cancel the command <:KannaWtf:320406412133924864>',
				].join(' '));

				return false;
			}

			// Break up -- remove both relations and reset other attributes
			if (/^(y|yes)/i.test(breakUpConfirmation.content)) {
				const transaction: Transaction = await this.sequelize.transaction();

				partner.partnerId = undefined;
				partner.partnerSince = undefined;
				partner.partnerMarried = undefined;

				authorModel.partnerId = undefined;
				authorModel.partnerSince = undefined;
				authorModel.partnerMarried = undefined;

				await Promise.all([
					authorModel.save({ transaction }),
					partner.save({ transaction }),
				]);

				await transaction.commit();

				return true;
			}

			await message.reply('cancelling the command... <:KannaWtf:320406412133924864>');

			return false;
		}

		// Are those two together for at least a month?
		// Days * hours * minutes * seconds * milliseconds (large to small)
		if ((partner.partnerSince.valueOf() + (30 * 24 * 60 * 60 * 1000)) > message.createdTimestamp) {
			await message.reply(
				'sorry but not enough time has passed since you two got together! <:KannaAyy:315270615844126720>',
			);

			return false;
		}

		if (authorModel.partnerMarried) {
			await message.reply('you two are already married.');

			return false;
		}

		await message.channel.send(
			`${mentionedUser} and ${message.author}! Do you two want to marry? (**Y**es or **N**o)`,
		);

		const filter: CollectorFilter = (msg: Message): boolean => msg.author.id === mentionedUser.id
			&& /^(y|n|yes|no)/i.test(msg.content);

		const confirmation: Message = await message.channel.awaitMessages(filter, { time: 10000, max: 1 })
			.then((collected: Collection<Snowflake, Message>) => collected.first());

		if (!confirmation) {
			await message.reply([
				'looks like you got no response, so',
				'I had to cancel the command <:FeelsKannaMan:341054171212152832>',
			].join(' '));

			return false;
		}

		if (/^(y|yes)/i.test(confirmation.content)) {
			const transaction: Transaction = await this.sequelize.transaction();

			partner.partnerMarried = true;
			authorModel.partnerMarried = true;

			await Promise.all([
				authorModel.save({ transaction }),
				partner.save({ transaction }),
			]);

			await transaction.commit();

			await message.channel.send(
				`Congratulations ${message.author} and ${mentionedUser} for your marriage! <:KannaHug:299650645001240578>`,
			);

			return false;
		}

		await message.reply('cancelling the command... <:KannaAyy:315270615844126720>');

		return false;
	}

	/**
	 * Starts a relationship with the mentioned user.
	 * @param message Incoming message
	 * @param mentionedUser Mentioned user
	 * @param authorModel Database model for the author of the message
	 * @param partnerModel Database model for the mentioned user
	 */
	private async relationStart(
		message: Message,
		mentionedUser: User,
		authorModel: UserModel,
		partnerModel: UserModel,
	): Promise<Message | Message[]> {
		await message.channel.send(
			`${mentionedUser}, ${message.author} proposed to you! Do you want to accept? (**Y**es / **N**o)`,
		);

		const filter: CollectorFilter = (msg: Message): boolean => msg.author.id === mentionedUser.id
			&& /^(y|n|yes|no)/i.test(msg.content);

		const confirmation: Message = await message.channel.awaitMessages(filter, { time: 90000, max: 1 })
			.then((collected: Collection<Snowflake, Message>) => collected.first());

		if (!confirmation) {
			return message.reply([
				'looks like you got no response, so',
				'I had to cancel the command <:FeelsKannaMan:341054171212152832>',
			].join(' '));
		}

		if (/^(y|yes)/i.test(confirmation.content)) {
			const transaction: Transaction = await this.sequelize.transaction();

			// Sequelize method seems to not work as expected /shrug
			partnerModel.partnerId = message.author.id;
			partnerModel.partnerSince = new Date();
			partnerModel.partnerMarried = false;

			authorModel.partnerId = mentionedUser.id;
			authorModel.partnerSince = new Date();
			authorModel.partnerMarried = false;

			await Promise.all([
				authorModel.save({ transaction }),
				partnerModel.save({ transaction }),
			]);

			await transaction.commit();

			return message.channel.send([
				`Congratulations ${message.author} and ${mentionedUser}! If you are still together in a month,`,
				'you can use propose again to marry! <:KannaHello:345776146404605952>',
			].join(' '));
		}

		return message.reply('you got rejected. <:FeelsKannaMan:341054171212152832>');
	}
}

export { ProposeCommand as Command };