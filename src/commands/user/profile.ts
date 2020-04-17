import { Guild, GuildMember, Message, User } from 'discord.js';
import * as moment from 'moment';
import { QueryTypes } from 'sequelize';

import { Badge } from '../../models/Badge';
import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { titleCase } from '../../util/Util';

class ProfileCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['pf'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Display someones or your own profile',
			examples: ['profile', 'profile wizard'],
			exp: 0,
			usage: 'profile [User]',
		});
	}

	public async parseArgs(message: GuildMessage, [input]: string[]): Promise<string | [User]>
	{
		if (!input) return [message.author];

		const user: User | undefined = await this.resolver.resolveMember(input, message.guild, false)
			.then((member: GuildMember | undefined) => member
				? member.user
				: this.resolver.resolveUser(input, false),
			);

		if (!user) return `I could not find a non-bot user with the name or id **${input}**.`;

		return [user];
	}

	public async run(
		message: GuildMessage,
		[user]: [User], { authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]>
	{
		const embed: MessageEmbed = await this.fetchEmbed(message, authorModel, user);
		return message.channel.send(embed);
	}

	public async fetchEmbed(
		{ author, guild }: { author: User; guild: Guild },
		authorModel: UserModel,
		user: User,
	): Promise<MessageEmbed>
	{
		const [userModel]: [UserModel, boolean] = await UserModel.findCreateFind({
			include: [
				{
					as: 'badges',
					model: Badge,
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

		let partnerString: string = 'Hidden';

		if (!userModel.partnerHidden)
		{
			const partner: User | undefined = userModel.partnerId
				? this.client.users.cache.get(userModel.partnerId)
				|| await this.client.users.fetch(userModel.partnerId).catch(() => undefined)
				: undefined;

			partnerString = partner
				? `${userModel.partnerMarried ? 'Married' : 'Together'} with **${partner.tag}**`
				: 'Single';
		}

		let userTime: string = 'No timezone set.';

		if (typeof userModel.timezone === 'number')
		{
			const time: string = moment().utc().add(userModel.timezone, 'hours').format('dddd Do H:mm');
			const timezone: string | number = userModel.timezone >= 0 ? `+${userModel.timezone}` : userModel.timezone;
			userTime = `${time} (UTC ${timezone})`;
		}

		const embed: MessageEmbed = MessageEmbed.common({ author }, userModel)
			.setThumbnail(guild.iconURL())
			.setAuthor(`${titleCase(user.username)}'s Profile`, user.displayAvatarURL())
			.setDescription('\u200b')
			.addField('Level', `${userModel.level} (${(userModel.exp || 0).toLocaleString()} exp)`, true)
			.addField('Reputation', (reputation || 0).toLocaleString(), true)
			.addField('Badges', this.mapItems(userModel.badges), true)
			.addField('Time', userTime, true)
			.addField('Relationship', partnerString, true);

		if (!userModel.partnerHidden && user === author && userModel.partnerId)
		{
			const offset: number = authorModel.timezone || 0;
			const anniversary: string = moment(userModel.partnerSince ?? 0)
				// .utc() because we .add() the utc offset to display the correct date
				.utc()
				.add(offset, 'hours')
				.format('YYYY-MM-DD');

			embed.addField('Relationship Anniversary', `${anniversary} (UTC ${offset >= 0 ? '+' : ''}${offset})`, true);
		}

		return embed;
	}

	/**
	 * Maps an array of items (or badges) to a readable string.
	 * @param items Array of items to map
	 */
	private mapItems(items: Badge[] | undefined): string
	{
		if (!items || !items.length) return 'None';

		const formatted: string[] = [];
		for (const item of items)
		{
			formatted.push(titleCase(item.name.replace(/_/g, ' ')));
		}

		return formatted.join('\n');
	}
}

export { ProfileCommand as Command };
