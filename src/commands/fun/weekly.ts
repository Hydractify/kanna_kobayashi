import { Message } from 'discord.js';
import { get, Result } from 'snekfetch';

import { Item } from '../../models/Item';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

const { dbotsorg }: { dbotsorg: string } = require('../../../data');

class WeeklyCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['wk'],
			coins: 0,
			clientPermissions: ['EMBED_LINKS'],
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
		): Promise<string | string[]> {
		const votes: Result = await get('https://discordbots.org/api/bots/297459926505095180/votes?onlyids=true')
		.set('Authorization', dbotsorg);

		const voters: string[] = JSON.parse(votes.text)[0];

		if (voters.includes(message.author.id)) return [];

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
		.setAuthor(`Wait a moment ${message.author.username}!`, message.author.displayAvatarURL())
		.setDescription(
			'You must upvote Kanna Kobayashi on (Discord Bots List)[https://discordbots.org/bot/297459926505095180] first!',
		)
		.addField(
			'How to Upvote!',
			[
				'**1.** Login on https://discordbots.org',
				'**2.** Open Kanna\'s [page](https://discordbots.org/bot/297459926505095180) on the website',
				'**3.** Use the command again',
				'**4.** Profit?',
			].join('\n'),
		);

		message.reply(embed);

		return '';
	}

	public async run(
		message: Message,
		__: string[],
		{ authorModel }: ICommandRunInfo,
		): Promise<Message | Message[]> {
		const totalScales: number = (authorModel.tier || 0) + 1;

		return message.reply(`Here are your weekly Dragon Scales, you have gotten **${totalScales}** scales!`);
	}
}

export { WeeklyCommand as Command };
