import { Collection, CollectorFilter, Message, Snowflake } from 'discord.js';
import { Transaction } from 'sequelize';

import { User as UserModel } from '../../models/User';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { WeebCommand } from '../../structures/WeebCommand';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IWeebResolvedMember } from '../../types/weeb/IWeebResolvedMember';

class KissCommand extends WeebCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			action: 'kissed',
			clientPermissions: ['EMBED_LINKS'],
			description: 'K-kiss someone! ',
			emoji: '<:KannaLewd:320406420824653825>',
			examples: ['kiss kanna', 'kiss kanna wizard'],
			name: 'kiss',
			type: 'kiss',
			usage: 'kiss <...User>',
		});
	}

	public async run(
		message: Message,
		[members]: [Collection<Snowflake, IWeebResolvedMember>],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		if (members && members.size === 1) {
			if (members.has(message.client.user.id)) return message.reply('h-hentai da! <:KannaLewd:320406420824653825>')
		}

		const check: boolean = await this.ensureValidTargets(message, authorModel, members);
		if (!check) return undefined;

		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, members, {
			bot: 'W-what!?',
			dev: 'W-why!?',
			trusted: `**${members.first().name}**... My developers can trust you, but i do not!`,
		});
		const baseString: string = this.computeBaseString(message, members);

		return message.channel.send(baseString, embed);
	}

	// TODO: Make this somehow better.
	private async ensureValidTargets(
		message: Message,
		authorModel: UserModel,
		members: Collection<Snowflake, IWeebResolvedMember>,
	): Promise<boolean> {
		// Has a partner?
		if (authorModel.partnerId) {
			// Only allow one target
			if (members.size > 1) {
				await message.reply('you can only kiss your partner!');

				return false;
			}

			const target: IWeebResolvedMember = members.first();
			if ([message.author.id, authorModel.partnerId].includes(target.member.id)) {
				return true;
			}

			const breakMessage: Message = await message.reply(
				'do you want to break with your current partner? (**Y**es or **N**o) <:KannaWtf:320406412133924864>',
			) as Message;

			const filter: CollectorFilter = (msg: Message): boolean => msg.author.id === message.author.id
				&& /^(y|n|yes|no)/i.test(msg.content);
			const collectedMessage: Message = await message.channel.awaitMessages(filter, { time: 1e4, max: 1 })
				.then((collected: Collection<Snowflake, Message>) => collected.first());

			if (!collectedMessage) {
				await message.channel.send([
					`${message.author}... since you did not respond properly,`,
					'I had to cancel the command <:KannaWtf:320406412133924864>',
				].join(' '));
				await breakMessage.delete();

				return false;
			}

			// TODO: Make this not a mess, and remove code duplication.
			if (/^(y|yes)/i.test(collectedMessage.content)) {
				const partner: UserModel = await authorModel.$get<UserModel>('partner') as UserModel;
				const { partnerId } = authorModel;

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

				await Promise.all([
					message.reply(`you successfully broke up with <@${partnerId}>`),
					breakMessage.delete(),
				]);

				return true;
			}

			await Promise.all([
				message.reply('s-successfully canceled the command! <:KannaWtf:320406412133924864>'),
				breakMessage.delete(),
			]);

			return false;
		} // Has a partner

		// Only one target?
		if (members.size === 1) {
			// Has it a partner?
			if (members.first().partnerId) {
				await message.reply(
					`**${members.first().name}** has a partner! Canceling the command! <:KannaLewd:320406420824653825>`,
				);

				return false;
			}
		}

		// Filter all members with a partner
		const filteredMembers: Collection<Snowflake, IWeebResolvedMember> =
			members.filter((member: IWeebResolvedMember) => Boolean(member.partnerId));

		// Do we have some?
		if (filteredMembers.size) {
			// Map their names
			const names: string[] = filteredMembers.map((member: IWeebResolvedMember) => member.name);

			// Proper grammar
			const response: string = names.length === 1
				? `**${names[0]} has`
				: `**${names.slice(0, -1).join('**, **').slice(0, -2)} and **${names[names.length - 1]}** have`;

			await message.reply(
				`**${response} a partner! Canceling the command! <:KannaLewd:320406420824653825>`,
			);

			return false;
		}

		return true;
	}
}

export { KissCommand as Command };
