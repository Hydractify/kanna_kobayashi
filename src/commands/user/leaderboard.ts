import { Message, User as DJSUser } from 'discord.js';
import { Model } from 'sequelize-typescript';

import { User } from '../../models/User';
import { UserReputation } from '../../models/UserReputation';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { titleCase } from '../../util/Util';

class LeaderboardCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['lb'],
			coins: 0,
			description: 'See the best of the best!',
			examples: ['leaderboard level'],
			exp: 0,
			name: 'leaderboard',
			usage: 'leaderboard [\'level\', \'coins\', \'rep\']',
		});
	}

	public async orderRep(
		message: Message,
		input: string,
		authorModel: User,
	): Promise<Message | Message[]> {
		return message.reply('wip o3o');
	}

	public parseArgs(message: Message, [input]: string[]): string | string[] {
		if (['exp', 'coins', 'rep'].includes(input)) return [input];
		if (!input) return ['exp'];

		return `you must give me a valid method! (\`${this.usage}\`)`;
	}

	public async run(
		message: Message,
		[input]: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		if (input === 'rep') return this.orderRep(message, input, authorModel);

		const userModels: User[] = await User.findAll({ limit: 5, order: [[input, 'desc']]});

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
		.setTitle(`${titleCase(input)} Leaderboard`)
		.setDescription(`These are the top 5 users with the highest ${input} yet`);
		for (let i: number = 0; i < userModels.length; i++) {
			const userModel: User = userModels[i];
			let user: DJSUser = message.client.users.get(userModel.id);
			if (!user) user = await message.client.users.fetch(userModel.id);

			embed.addField(
				`${i + 1}. ${user.tag}`,
				[
					`Level: ${userModel.level}`,
					`Coins: ${userModel.coins}`,
				].join('\n'),
			);
		}

		return message.reply(embed);
	}
}

export { LeaderboardCommand as Command };
