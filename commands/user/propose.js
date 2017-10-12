const Command = require('../../structures/Command');
const { instance: { db } } = require('../../structures/PostgreSQL');

class ProposeCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['marry'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			cooldown: 10000,
			description: 'Propose to someone... You love! <:KannaAyy:315270615844126720>',
			examples: ['propose Wizard'],
			exp: 0,
			name: 'propose',
			usage: 'propose <User>'
		});
	}

	async run(message, [input]) {
		if (!input) return message.reply(` you must give me a user! (\`${this.usage}\`)`);
		const mentionedUser = await this.handler.resolveUser(input, false);
		if (!mentionedUser) return message.reply(` I could not find a non bot user with ${input}.`);
		if (mentionedUser.id === message.author.id) return message.reply(' you can not propose to yourself.');

		if (!message.author.model) await message.author.fetchModel();
		if (!mentionedUser.model) await mentionedUser.fetchModel();

		const checked = await this.relationCheck(message, mentionedUser);

		if (!checked) return undefined;
		return this.relationStart(message, mentionedUser);
	}

	/**
	 * Verify that the mentioned user is the current partner or no parter is currently present at all.
	 * If the mentioned user differs ask to break up.
	 * Returns whether to start a new relationship with the mentioned user.
	 * @param {Message} message Incoming message
	 * @param {User} mentionedUser Mentioned user
	 * @return {Promise<boolean>}
	 */
	async relationCheck(message, mentionedUser) {
		const partner = await message.author.model.getPartner();

		// No partner present, green light for a new one
		if (!partner) return true;
		const { model: authorModel } = message.author;

		// Mentioned user is not the current user
		if (partner.id !== mentionedUser.id) {
			await message.reply(
				' are you sure you want to break with you current partner? (**Y**es or **N**o) <:KannaWtf:320406412133924864>'
			);

			const filter = msg => msg.author.id === mentionedUser.id
				&& /^(y|n|yes|no)/i.test(msg.content);

			const collected = await message.channel.awaitMessages(filter, { time: 10000, maxMatches: 1 });

			if (!collected.size) {
				await message.channel.send([
					`${message.author}... as you did not tell me yes or no,`,
					'I had to cancel the command <:KannaWtf:320406412133924864>'
				].join(' '));

				return false;
			}

			// Break up -- remove both relations and reset other attributes
			if (/^(y|yes)/i.test(collected.first())) {
				const transaction = await db.transaction();

				partner.partnerId = null;
				partner.partnerSince = null;
				partner.partnerMarried = null;

				authorModel.partnerId = null;
				authorModel.partnerSince = null;
				authorModel.partnerMarried = null;

				await Promise.all([
					authorModel.save({ transaction }),
					partner.save({ transaction })
				]);

				await transaction.commit();

				return true;
			}

			await message.reply(' cancelling the command... <:KannaWtf:320406412133924864>');

			return false;
		}

		// Are those two together for at least a month?
		// Days * hours * minutes * seconds * milliseconds (large to small)
		if ((partner.partnerSince.valueOf() + (30 * 24 * 60 * 60 * 1000)) > message.createdTimestamp) {
			await message.reply(
				' sorry but not enough time has passed since you two got together! <:KannaAyy:315270615844126720>'
			);

			return false;
		}

		if (authorModel.partnerMarried) {
			await message.reply(' you two are already married.');

			return false;
		}

		await message.channel.send(
			`${mentionedUser} and ${message.author}! Do you two want to marry? (**Y**es or **N**o)`
		);

		const filter = msg => msg.author.id === mentionedUser.id
			&& /^(y|n|yes|no)/i.test(msg.content);

		const collected = await message.channel.awaitMessages(filter, { time: 10000, maxMatches: 1 });

		if (!collected.size) {
			await message.channel.send([
				`${message.author}, looks like you got no response, so`,
				'I had to cancel the command <:FeelsKannaMan:341054171212152832>'
			].join(' '));

			return false;
		}

		if (/^(y|yes)/i.test(collected.first())) {
			const transaction = await db.transaction();

			partner.partnerMarried = true;
			authorModel.partnerMarried = true;

			await Promise.all([
				authorModel.save({ transaction }),
				partner.save({ transaction })
			]);

			await transaction.commit();

			await message.channel.send(
				`Congratulations ${message.author} and ${mentionedUser} for your marriage! <:KannaHug:299650645001240578>`
			);

			return false;
		}

		await message.reply(' cancelling the command... <:KannaAyy:315270615844126720>');

		return false;
	}

	/**
	 * Starts a relationship with the 
	 * @param {Message} message Incoming message
	 * @param {User} mentionedUser Mentioned user
	 * @returns {Promise<Message>}
	 */
	async relationStart(message, mentionedUser) {
		await message.channel.send(
			`${mentionedUser}, ${message.author} proposes to you! Do you want to accept? (**Y**es / **N**o)`
		);

		const filter = msg => msg.author.id === mentionedUser.id
			&& /^(y|n|yes|no)/i.test(msg.content);

		const collected = await message.channel.awaitMessages(filter, { time: 10000, maxMatches: 1 });

		if (!collected.size) {
			return message.channel.send([
				`${message.author}, looks like you got no response, so`,
				'I had to cancel the command <:FeelsKannaMan:341054171212152832>'
			].join(' '));
		}

		if (/^(y|yes)/i.test(collected.first())) {
			const { model: partner } = mentionedUser;
			const { model: authorModel } = message.author;

			const transaction = await db.transaction();

			// Sequelize method seems to not work as expected /shrug
			partner.partnerId = message.author.id;
			partner.partnerSince = new Date();
			partner.partnerMarried = false;

			authorModel.partnerId = mentionedUser.id;
			authorModel.partnerSince = new Date();
			authorModel.partnerMarried = false;

			await Promise.all([
				authorModel.save({ transaction }),
				partner.save({ transaction })
			]);

			await transaction.commit();

			return message.channel.send([
				`Congratulations ${message.author} and ${mentionedUser}! If you are still together in a month,`,
				'you can use propose again to marry! <:KannaHello:345776146404605952>'
			].join(' '));
		}

		return message.reply('you got rejected. <:FeelsKannaMan:341054171212152832>');
	}
}

module.exports = ProposeCommand;
