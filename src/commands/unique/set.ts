import { Message, User } from 'discord.js';
import { Transaction } from 'sequelize';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { Items } from '../../types/Items';
import { PermLevels } from '../../types/PermLevels';

type PartnerArgs = ['partner', User, User, boolean];
type PatronArgs = ['patron', User, number];
type SetCommandArgs = PartnerArgs | PatronArgs;

class SetCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			coins: 0,
			cooldown: 0,
			description: 'Command to help with various administrative tasks.',
			examples: ['set'],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.DEV,
			usage: 'set <type> <...args>',
		});
	}

	public async parseArgs(
		message: Message,
		[type, ...args]: string[],
	): Promise<SetCommandArgs | string> {
		type = type.toLowerCase();

		if (type === 'partner') {
			const [strOne, strTwo, strMarried]: string[] = args;

			const userOne: User | undefined = await this.resolver.resolveUser(strOne, false);
			if (!userOne) {
				return 'could not resolve user one.';
			}

			const userTwo: User | undefined = await this.resolver.resolveUser(strTwo, false);
			if (!userTwo) {
				return 'could not resolve user two.';
			}

			const married: boolean = strMarried[0] ? strMarried[0].toLowerCase() === 'y' : false;

			return [type, userOne, userTwo, married];
		}

		if (type === 'patron') {
			const [strOne, strTier]: string[] = args;

			const userOne: User | undefined = await this.resolver.resolveUser(strOne, false);
			if (!userOne) {
				return 'could not resolve user.';
			}

			const tier: number = parseInt(strTier);

			if (isNaN(tier) || tier < 0) {
				return 'invalid tier, must be a non negative integer.';
			}

			return [type, userOne, tier];
		}

		return 'invalid type.';
	}

	public async run(message: Message, args: SetCommandArgs): Promise<Message | Message[]> {
		if (args[0] === 'partner') {
			const transaction: Transaction = await this.sequelize.transaction();

			try {
				await this._setPartner(transaction, args[1], args[2], args[3]);
				await transaction.commit();

				return message.reply(`successfully set partner statuses of **${args[1].tag}** and **${args[2].tag}**.`);
			} catch (error) {
				await transaction.rollback();

				throw error;
			}
		}

		if (args[0] === 'patron') {
			const transaction: Transaction = await this.sequelize.transaction();

			try {
				const model: UserModel = await args[1].fetchModel();
				model.tier = args[2];

				if (args[2] === 0) {
					await model.$remove('badges', Items.PATRON, { transaction });
				} else {
					await model.$add('badges', Items.PATRON, { transaction });
				}

				await model.save({ transaction });
				await transaction.commit();

				return message.reply(`successfully set patron status of **${args[1].tag}**.`);
			} catch (error) {
				await transaction.commit();

				throw error;
			}
		}

		throw new RangeError('Unknown type, should not be possible.');
	}

	private async _setPartner(transaction: Transaction, userOne: User, userTwo: User, married: boolean): Promise<void> {
		const [modelOne, modelTwo]: [UserModel, UserModel] = await Promise.all([userOne.fetchModel(), userTwo.fetchModel()]);

		if (modelOne.partnerId) {
			const partner: UserModel = await modelOne.$get('partner') as UserModel;
			partner.partnerId = null;
			partner.partnerMarried = null;
			partner.partnerSince = null;

			await partner.save({ transaction });
		}

		if (modelTwo.partnerId) {
			const partner: UserModel = await modelTwo.$get('partner') as UserModel;
			partner.partnerId = null;
			partner.partnerMarried = null;
			partner.partnerSince = null;

			await partner.save({ transaction });
		}

		modelOne.partnerId = modelTwo.id;
		modelOne.partnerMarried = married;
		modelOne.partnerSince = new Date();

		modelTwo.partnerId = modelOne.id;
		modelTwo.partnerMarried = married;
		modelTwo.partnerSince = new Date();

		await modelOne.save({ transaction });
		await modelTwo.save({ transaction });
	}
}

export { SetCommand as Command };
