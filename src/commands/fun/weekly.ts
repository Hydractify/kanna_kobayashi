import { Message } from 'discord.js';
import { get, Result } from 'snekfetch';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { Items } from '../../types/Items';

const { dbotsorg }: { dbotsorg: string } = require('../../../data');

class WeeklyCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['wk'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Get your weekly Dragon Scale!',
			examples: ['weekly'],
			exp: 0,
			name: 'weekly',
			usage: 'weekly',
		});
	}

	public async parseArgs(
		message: Message,
		input: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<MessageEmbed | undefined[]> {
		const { body: voters }: Result<string[]> = await get(
			'https://discordbots.org/api/bots/297459926505095180/votes?onlyids=true',
		).set('Authorization', dbotsorg);

		if (voters.includes(message.author.id)) return [];

		return MessageEmbed.common(message, authorModel)
			.setAuthor(`Wait a moment, ${message.author.username}!`, message.author.displayAvatarURL())
			.setDescription(
			'You have to upvote me on the [Discord Bot List](https://discordbots.org/bot/297459926505095180) first!',
		).addField(
			'How to Upvote!',
			[
				'**1.** Login on [Discord Bot List](https://discordbots.org)',
				'**2.** Open my [page](https://discordbots.org/bot/297459926505095180) there',
				'**3.** Use the command again',
				'**4.** Profit?',
			],
		);
	}

	public async run(
		message: Message,
		__: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const totalScales: number = authorModel.tier + 1;

		const newCount: number = await authorModel.addItem(Items.DRAGON_SCALE, totalScales);
		const suffix: string = `you now have ${newCount} Scale${newCount === 1 ? '' : 's'}.`;

		if (totalScales === 1) {
			return message.reply(['here is your weekly Dragon Scale!', suffix].join('\n'));
		}

		return message.reply([`here are your weekly **${totalScales}** Dragon Scales!`, suffix].join('\n'));
	}
}

export { WeeklyCommand as Command };
