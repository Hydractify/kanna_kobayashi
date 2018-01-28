import { CollectorFilter, DiscordAPIError, Message, MessageReaction, ReactionCollector, User } from 'discord.js';
import { QueryTypes } from 'sequelize';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { ILeaderBoardUser } from '../../types/ILeaderBoardUser';
import { titleCase } from '../../util/Util';
import { Command as ProfileCommand } from './profile';

class LeaderboardCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['lb'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'See the best of the best!',
			examples: [
				'leaderboard level',
				'leaderboard level 15',
			],
			exp: 0,
			name: 'leaderboard',
			usage: 'leaderboard [\'exp\', \'level\', \'coins\', \'reputation\'] [offset]',
		});
	}

	public parseArgs(message: Message, [input, offset]: string[]): string | [string, number] {
		if (!input) return ['exp', 0];
		if (['exp', 'coins', 'reputation'].includes(input.toLowerCase())) {
			if (!offset) return [input, 0];

			const num: number = parseInt(offset);
			if (isNaN(num)) return 'the offset you provided is not a number!';

			return [input, Math.max(0, num - 1)];
		}

		return `you must give me a valid method! (\`${this.usage}\`)`;
	}

	public async run(
		message: Message,
		[type, offset]: [string, number],
		{ authorModel }: ICommandRunInfo,
	): Promise<void> {
		const embedBuilder: (users: ILeaderBoardUser[], offset: number) => Promise<MessageEmbed>
			= this._embedFunction(message, authorModel, type);

		let users: ILeaderBoardUser[] = await this._fetchTop(type, offset);
		let embed: MessageEmbed = await embedBuilder(users, offset);
		const leaderboardMessage: Message = await message.channel.send(embed) as Message;

		const emojis: string[] = ['⬅', '1⃣', '2⃣', '3⃣', '4⃣', '➡'];
		const reactions: MessageReaction[] = [];

		const filter: CollectorFilter = (reaction: MessageReaction, user: User): boolean =>
			emojis.includes(reaction.emoji.name) && user.id === message.author.id;

		const promise: Promise<void> = new Promise<void>((resolve: () => void, reject: (error: Error) => void) => {
			const reactionCollector: ReactionCollector = leaderboardMessage.createReactionCollector(
				filter,
				{ time: 3e4 },
			).on('collect', async (reaction: MessageReaction) => {
				reaction.users.remove(message.author).catch(() => undefined);

				if (reaction.emoji.name === '➡') {
					// We are already on the last page
					if (!embed.fields.length) return;

					offset += 4;
					users = await this._fetchTop(type, offset);
					embed = await embedBuilder(users, offset);
					return leaderboardMessage.edit(embed)
						.catch((error: DiscordAPIError) => {
							reactionCollector.stop();
							reject(error);
						});
				}

				if (reaction.emoji.name === '⬅') {
					// We are already on the first page
					if (offset === 0) return;

					// Don't go further down than 0
					offset = Math.max(offset - 4, 0);
					users = await this._fetchTop(type, offset);
					embed = await embedBuilder(users, offset);
					return leaderboardMessage.edit(embed)
						.catch((error: DiscordAPIError) => {
							reactionCollector.stop();
							reject(error);
						});
				}

				const picked: ILeaderBoardUser = users[parseInt(reaction.emoji.name[0]) - 1];
				// If we are on the last page and somebody selects '4' we won't have a user
				if (!picked) return;

				const user: User = this.client.users.get(picked.id)
					|| await this.client.users.fetch(picked.id);

				// TODO: Make this not fetch everything again, somehow, if there is time, maybe.
				embed = await (this.handler.resolveCommand('profile') as ProfileCommand).fetchEmbed(message, user);

				await leaderboardMessage.edit(embed);
				reactionCollector.stop();
			}).on('end', () => {
				for (const reaction of reactions) reaction.users.remove().catch(() => undefined);
				resolve();
			});
		});

		for (const emoji of emojis) reactions.push(await leaderboardMessage.react(emoji));

		return promise;
	}

	private _embedFunction(
		message: Message,
		authorModel: UserModel,
		type: string,
	): (users: ILeaderBoardUser[], offset: number) => Promise<MessageEmbed> {
		return async (users: ILeaderBoardUser[], offset: number): Promise<MessageEmbed> => {
			const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
				.setTitle(`${titleCase(type)} Leaderboard`);

			if (!users.length) return embed.setDescription(`There is no user with the rank #${offset}.`);

			embed
				.setDescription([
					`Here are the users #${offset + 1} to #`,
					Math.max(offset + 4, offset + users.length),
					` with the highest ${type} as of now.`,
				].join(''))
				.setThumbnail(message.guild.iconURL());
			for (let i: number = 0; i < users.length; ++i) {
				const user: ILeaderBoardUser = users[i];
				const { tag }: User = message.client.users.get(user.id)
					|| await message.client.users.fetch(user.id);

				embed.addField(
					`${offset + i + 1}. ${tag}`,
					[
						`Level: ${user.level.toLocaleString()} (${user.exp.toLocaleString()} exp)`,
						`Coins: ${user.coins.toLocaleString()}`,
						`Reputation: ${user.reputation.toLocaleString()}`,
					].join('\n'),
					true,
				);
			}

			return embed;
		};
	}

	private async _fetchTop(
		type: string,
		offset: number,
	): Promise<ILeaderBoardUser[]> {
		const users: ILeaderBoardUser[] = await this.sequelize.query(
			// Not worth figuring out how to tell sequelize to build this query
			`SELECT
				"user"."id",
				COALESCE("user"."coins", 0) as "coins",
				COALESCE("user"."exp", 0) as "exp",
				COALESCE(
					sum(("user_reputations"."type"='POSITIVE')::int) - sum(("user_reputations"."type"='NEGATIVE')::int),
					0
				) AS reputation
			FROM "user_reputations" RIGHT OUTER JOIN "users" "user"
				ON "user"."id" = "user_reputations"."rep_id"
			GROUP BY "user"."id"
			ORDER BY "${type}" DESC
			OFFSET ?
			LIMIT 4;`,
			{
				replacements: [offset],
				type: QueryTypes.SELECT,
			},
		);

		for (const user of users) {
			// Only the finest js hacks; Calling the level getter of the user model in the context of the newly fetched "user"
			user.level = Object.getOwnPropertyDescriptor(UserModel.prototype, 'level').get.call(user);
		}

		return users;
	}
}

export { LeaderboardCommand as Command };
