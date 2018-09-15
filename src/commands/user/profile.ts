import { Guild, GuildMember, Message, User } from 'discord.js';
import { QueryTypes } from 'sequelize';

import { Item } from '../../models/Item';
import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { Emojis } from '../../types/Emojis';
import { titleCase } from '../../util/Util';

class ProfileCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['pf'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Display someones or your own profile',
			examples: ['profile', 'profile wizard'],
			usage: 'profile [User]',
		});
	}

	public async parseArgs(message: Message, [input]: string[]): Promise<string | [User]> {
		if (!input) return [message.author];

		const user: User = await this.resolver.resolveMember(input, message.guild, false)
			.then((member: GuildMember) => member
				? member.user
				: this.resolver.resolveUser(input, false),
		);

		if (!user) return `I could not find a non-bot user with the name or id **${input}**.`;

		return [user];
	}

	public async run(message: Message, [user]: [User]): Promise<Message | Message[]> {
		const embed: MessageEmbed = await this.fetchEmbed(message, user);
		return message.channel.send(embed);
	}

	public async fetchEmbed({ author, guild }: { author: User, guild: Guild }, user: User): Promise<MessageEmbed> {
		// No redis caching here because of includes, which wouldn't work then :c
		// Better than a bunch of single queries tho
		const [userModel] = await UserModel.findCreateFind({
			include: [
				{
					as: 'items',
					model: Item,
					required: false,
					through: { attributes: ['count'] },
				},
				{
					as: 'badges',
					model: Item,
					required: false,
					through: { attributes: ['count'] },
				},
			],
			where: { id: user.id },
		});

		// Get User's reputation
		const [{ reputation }]: [{ reputation: number }] = await this.sequelize.query(
			`SELECT
				sum(("user_reputations"."type"='POSITIVE')::int) - sum(("user_reputations"."type"='NEGATIVE')::int) AS reputation
			FROM "user_reputations"
			WHERE "user_reputations"."rep_id"=?;`,
			{
				replacements: [user.id],
				type: QueryTypes.SELECT,
			},
		);

		const partner: User = userModel.partnerId
			? this.client.users.get(userModel.partnerId)
			|| await this.client.users.fetch(userModel.partnerId).catch(() => undefined)
			: undefined;

		const partnerString: string = partner
			? `${userModel.partnerMarried ? 'Married' : 'Together'} with **${partner.tag}**`
			: 'Single';

		return MessageEmbed.common({ author }, userModel)
			.setThumbnail(guild.iconURL())
			.setAuthor(`${titleCase(user.username)}'s Profile`, user.displayAvatarURL())
			.setDescription('\u200b')
			.addField('Level', `${userModel.level} (${(userModel.exp || 0).toLocaleString()} exp)`, true)
			.addField('Reputation', (reputation || 0).toLocaleString(), true)
			.addField('Kanna Coins', `${(userModel.coins || 0).toLocaleString()} ${Emojis.Coin}`, true)
			.addField('Items', this.mapItems(userModel.items), true)
			.addField('Badges', this.mapItems(userModel.badges), true)
			.addField('Relationship', partnerString, true);
	}

	/**
	 * Maps an array of items (or badges) to a readable string.
	 * @param items Array of items to map
	 */
	private mapItems(items: Item[]): string {
		if (!items || !items.length) return 'None';

		const formatted: string[] = [];
		for (const item of items) {
			formatted.push(`${item.unique ? '' : `[${item.userItem.count}]`} ${titleCase(item.name.replace(/_/g, ' '))}`);
		}

		return formatted.join('\n');
	}
}

export { ProfileCommand as Command };
