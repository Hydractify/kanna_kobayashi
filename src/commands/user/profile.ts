import { GuildMember, Message, User } from 'discord.js';

import { Item } from '../../models/Item';
import { User as UserModel } from '../../models/User';
import { UserReputation } from '../../models/UserReputation';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { titleCase } from '../../util/Util';

class ProfileCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['pf'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Display someones or your own profile.',
			examples: ['profile', 'profile wizard'],
			exp: 0,
			name: 'profile',
			usage: 'profile [User]',
		});
	}

	public async parseArgs(message: Message, [input]: string[]): Promise<string | [User]> {
		const user: User = await this.resolver.resolveMember(input, message.guild, false)
			.then((member: GuildMember) => member
				? member.user
				: this.resolver.resolveUser(input, false),
		);

		if (!user) return `I could not find a non-bot user with the name or id **${input}**.`;

		return [user];
	}

	public async run(message: Message, [user]: [User]): Promise<Message | Message[]> {
		// No redis caching here because of includes, which wouldn't work then :c
		// Better than a bunch of single queries tho
		const [userModel] = await UserModel.findCreateFind({
			include: [
				{
					as: 'items',
					through: { attributes: ['count'] },
					model: Item,
					required: false,
				},
				{
					as: 'badges',
					through: { attributes: ['count'] },
					model: Item,
					required: false,
				},
				{
					as: 'partner',
					model: UserModel,
					required: false,
				},
			],
			where: { id: user.id },
		});

		// Get User's reputation
		const { POSITIVE: positive = 0, NEGATIVE: negative = 0 } = await UserReputation.count({
			where: { repId: user.id },
			attributes: ['type'],
			group: ['type'],
			// tslint:disable-next-line:no-any
		}).then((results: any) => {
			const reps: { [key: string]: number } = {};
			for (const result of results) reps[result.type] = result.count;

			return reps;
		});

		const reputation: number = positive - negative;

		const partner: User = userModel.partnerId
			? this.client.users.get(userModel.partnerId)
			|| await this.client.users.fetch(userModel.partnerId).catch(() => undefined)
			: undefined;

		const partnerString: string = partner
			? `${userModel.partnerMarried ? 'Married' : 'Together'} with **${partner.tag}**`
			: 'Single';

		const embed: MessageEmbed = MessageEmbed.common(message, userModel)
			.setThumbnail(message.guild.iconURL())
			.setAuthor(`${titleCase(user.username)}'s Profile`, user.displayAvatarURL())
			.setDescription('\u200b')
			.addField('Level', `${userModel.level} (${userModel.exp} exp)`, true)
			.addField('Reputation', reputation, true)
			.addField('Kanna Coins', `${userModel.coins} <:coin:330926092703498240>`, true)
			.addField('Items', this.mapItems(userModel.items), true)
			.addField('Badges', this.mapItems(userModel.badges), true)
			.addField('Relationship', partnerString, true);

		return message.channel.send(embed);
	}

	/**
	 * Maps an array of items (or badges) to a readable string.
	 * @param items Array of items to map
	 */
	private mapItems(items: Item[]): string {
		if (!items.length) return 'None';

		const formatted: string[] = [];
		for (const item of items) {
			formatted.push(`${item.unique ? '' : `[${item.userItem.count}]`} ${item.name}`);
		}

		return formatted.join('\n');
	}
}

export { ProfileCommand as Command };
