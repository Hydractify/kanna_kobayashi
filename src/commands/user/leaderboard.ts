import { Guild, Message, MessageReaction, User } from 'discord.js';
import { QueryTypes } from 'sequelize';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { ILeaderBoardUser } from '../../types/ILeaderBoardUser';
import { IResponsiveEmbedController } from '../../types/IResponsiveEmbedController';
import { titleCase } from '../../util/Util';
import { Command as ProfileCommand } from './profile';

class LeaderboardCommand extends Command implements IResponsiveEmbedController {
	public emojis: string[] = ['⬅', '1⃣', '2⃣', '3⃣', '4⃣', '➡'];
	public types: string[] = ['exp', 'coins', 'reputation'];

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['lb'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'See the best of the best!',
			examples: [
				'leaderboard level',
				'leaderboard level 15',
			],
			name: 'leaderboard',
			usage: 'leaderboard [\'exp\', \'level\', \'coins\', \'reputation\'] [offset]',
		});
	}

	public parseArgs(message: Message, [input, offset]: string[]): string | [string, number] {
		if (!input) return ['exp', 0];
		if (this.types.includes(input.toLowerCase())) {
			if (!offset) return [input, 0];

			const num: number = parseInt(offset);
			if (isNaN(num)) return 'the offset you provided is not a number!';

			return [input, Math.max(0, num - 1)];
		}

		return `you must give me a valid method! (\`${this.usage}\`)`;
	}

	public async onCollect({ message, emoji, users: reactors }: MessageReaction, user: User): Promise<Message> {
		const [embed]: MessageEmbed[] = message.embeds as MessageEmbed[];
		const [, type, match]: RegExpExecArray = /.+? \| (.+):(\d+) \|/
			.exec(message.embeds[0].footer.text) || [] as any;
		let offset: number = parseInt(match);

		if (
			match === undefined
			|| isNaN(offset)
			|| !this.types.includes(type)
		) return;
		reactors.remove(user);

		if (emoji.name === '➡') {
			// We are already on the last page
			if (!embed.fields.length) return;
			offset += 4;

			const users: ILeaderBoardUser[] = await this._fetchTop(type, offset);
			const newEmbed: MessageEmbed = await this._fetchEmbed(user, type, offset, message.guild, users);
			return message.edit(newEmbed);
		}
		if (emoji.name === '⬅') {
			// We are already on the first page
			if (offset <= 0) return;
			// Don't go further down than 0
			offset = Math.max(offset - 4, 0);

			const users: ILeaderBoardUser[] = await this._fetchTop(type, offset);
			const newEmbed: MessageEmbed = await this._fetchEmbed(user, type, offset, message.guild, users);
			return message.edit(newEmbed);
		}

		const [picked]: ILeaderBoardUser[] = await this._fetchTop(
			type,
			// 0 indexed
			offset + parseInt(emoji.name[0]) - 1,
			1,
		);

		// If we are on the last page we maybe have no user
		if (!picked) return;

		const pickedUser: User = this.client.users.get(picked.id)
			|| await this.client.users.fetch(picked.id);

		for (const reaction of message.reactions.values()) {
			if (reaction.me) reaction.users.remove().catch(() => undefined);
		}

		return message.edit(await (this.handler.resolveCommand('profile') as ProfileCommand)
			.fetchEmbed({ author: user, guild: message.guild }, pickedUser),
		);
	}

	public async run(
		message: Message,
		[type, offset]: [string, number],
		{ authorModel }: ICommandRunInfo,
	): Promise<void> {
		const users: ILeaderBoardUser[] = await this._fetchTop(type, offset);
		const embed: MessageEmbed = await this._fetchEmbed(message.author, type, offset, message.guild, users);
		const leaderboardMessage: Message = await message.channel.send(embed) as Message;

		for (const emoji of this.emojis) await leaderboardMessage.react(emoji);
	}
	private async _fetchEmbed(
		author: User,
		type: string,
		offset: number,
		guild: Guild,
		users: ILeaderBoardUser[],
	): Promise<MessageEmbed> {
		const embed: MessageEmbed = MessageEmbed.common({ author }, await author.fetchModel())
			.setTitle(`${titleCase(type)} Leaderboard`);

		embed.footer.text += ` | ${type}:${offset} | Leaderboard`;

		if (!users.length) return embed.setDescription(`There is no user with the rank #${offset}.`);

		embed
			.setDescription([
				`Here are the users #${offset + 1} to #`,
				Math.max(offset + 4, offset + users.length),
				` with the highest ${type} as of now.`,
			].join(''))
			.setThumbnail(guild.iconURL());
		for (let i: number = 0; i < users.length; ++i) {
			const user: ILeaderBoardUser = users[i];
			const { tag }: User = this.client.users.get(user.id)
				|| await this.client.users.fetch(user.id);

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
	}

	private async _fetchTop(
		type: string,
		offset: number,
		limit: number = 4,
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
			LIMIT ?;`,
			{
				replacements: [offset, limit],
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
