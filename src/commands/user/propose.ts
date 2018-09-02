import { Collection, CollectorFilter, Message, Snowflake, User } from 'discord.js';
import * as moment from 'moment';
import { Transaction } from 'sequelize';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class ProposeCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['marry'],
			cooldown: 1e4,
			description: 'Propose to someone... You love! <:kannaShy:458779242696540170>',
			examples: ['propose Wizard'],
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

			await message.reply('you are already in a relationship with somebody else... <:kannaScared:458776266154180609>');

			return false;
		}

		// Are those two together for at least a month?
		// Days * hours * minutes * seconds * milliseconds (large to small)
		const until = partner.partnerSince.valueOf() + (30 * 24 * 60 * 60 * 1000);
		if (until > message.createdTimestamp) {
			await message.reply([
				'sorry but not enough time has passed since you two got together! <:kannaShy:458779242696540170>',
				`Try again in ${moment(until).fromNow()}.`,
			].join('\n'));

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
				'I had to cancel the command <:kannaSad:458776254666244127>',
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
				`Congratulations ${message.author} and ${mentionedUser} for your marriage! <:kannaHug:460080146418892800>`,
			);

			return false;
		}

		await message.reply('canceling the command... <:kannaShy:458779242696540170>');

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
				'I had to cancel the command <:kannaSad:458776254666244127>',
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
				'you can use propose again to marry! <:kannaGreetings:458776090752843786>',
			].join(' '));
		}

		return message.reply('you got rejected. <:kannaScared:458776266154180609>');
	}
}

export { ProposeCommand as Command };
