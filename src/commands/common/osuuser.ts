import { Message } from 'discord.js';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { Beatmap } from '../../structures/osu/Beatmap';
import { Score } from '../../structures/osu/Score';
import { User } from '../../structures/osu/User';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { OsuMode } from '../../types/osu/OsuMode';

class OsuUserCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['osu'],
			coins: 0,
			description: 'Show basic information, or best or recent plays about a user.',
			examples: ['osu SpaceEEC', 'osu SpaceEEC best', 'osu SpaceEEC recent', 'osu SpaceEEC taiko'],
			exp: 0,
			name: 'osuuser',
			usage: 'osucommand <UsernameOrID> [Mode] [\'top\'|\'recent\']',
		});

	}

	public parseArgs(message: Message, [query, modeOrOption, option]: string[]): [string, OsuMode, string] | string {
		if (!query) return 'you have to tell me who you want to look up!';

		let mode: OsuMode = OsuMode.OSU;
		if (modeOrOption) {
			modeOrOption = modeOrOption.toUpperCase();
			const tempMode: OsuMode = OsuMode[modeOrOption as any] as any;
			if (tempMode) mode = tempMode;
			else option = modeOrOption;
		}

		if (option) {
			option = option.toLowerCase();
			if (!['best', 'recent'].includes(option)) {
				return `"${option}" is not a valid option! Valid options are "best" and "recent".`;
			}
		}

		return [query, mode, option];
	}

	public async run(
		message: Message,
		[query, mode, option]: [string, OsuMode, 'best' | 'recent' | undefined],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		if (option) return this.fetchScores(message, authorModel, query, mode, option);

		const user: User = await User.fetch(query, mode);
		if (!user) return message.reply('I could not find any user matching your query.');

		const embed: MessageEmbed = this.embed(message, authorModel, user)
			.addField('Performance Points', `${user.pp.toLocaleString()}pp`, true)
			.addField('Rank', `# ${user.rank.toLocaleString()}`, true)
			.addField('National Rank', `# ${user.countryRank.toLocaleString()}`, true)

			.addField('Accuracy', `${user.accuracy.toFixed(2)}%`, true)
			.addField('Level', user.level.toFixed(2), true)
			.addBlankField(true)

			.addField('Total Plays', user.playCount.toLocaleString(), true)
			.addField('Ranked Score', user.rankedScore.toLocaleString(), true)
			.addField('Total Score', user.totalScore.toLocaleString(), true)

			.addField('SS', user.countSS.toLocaleString(), true)
			.addField('S', user.countS.toLocaleString(), true)
			.addField('A', user.countA.toLocaleString(), true);

		return message.channel.send(embed);
	}

	private embed(message: Message, authorModel: UserModel, user: User): MessageEmbed {
		return MessageEmbed.common(message, authorModel)
			.setAuthor(user.username, user.iconURL, user.profileURL)
			.setDescription(user.countryFlag);
	}

	private async fetchScores(
		message: Message,
		authorModel: UserModel,
		query: string,
		mode: OsuMode,
		type: 'best' | 'recent',
	): Promise<Message | Message[]> {
		const user: User = await User.fetch(query);
		if (!user) return message.reply('I could not find any user matching your query.');

		const scores: Score[] = type === 'best'
			? await user.fetchBest({ mode })
			: await user.fetchRecent({ mode });
		if (!scores.length) return message.reply(`I could not find any ${type} scores!`);

		const embed: MessageEmbed = this.embed(message, authorModel, user);

		for (const score of scores) {
			const beatmap: Beatmap = await score.fetchBeatmap();
			const mods: string = score.enabledMods;
			const pp: string = score.pp ? ` -- **${score.pp.toFixed(2)}**` : '';
			embed.addField(
				`${beatmap.artist} - ${beatmap.title} [${beatmap.version}]${mods ? ` +${mods}` : ''}`,
				`${score.rank} -- [URL](${beatmap.versionURL()}) -- ${score.date.fromNow() + pp}`,
			);
		}

		return message.channel.send(embed);
	}
}

export { OsuUserCommand as Command };
