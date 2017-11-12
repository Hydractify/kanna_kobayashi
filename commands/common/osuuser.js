const Command = require('../../structures/Command');
const { User } = require('../../structures/osu');
const RichEmbed = require('../../structures/RichEmbed');

class OsuUserCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['osu'],
			coins: 0,
			exp: 0,
			usage: 'osucommand <UsernameOrID> [Mode] [\'top\'|\'recent\']',
			description: 'Show basic information, or best or recent plays about a user.',
			name: 'osucommand',
			examples: ['osu SpaceEEC', 'osu SpaceEEC best', 'osu SpaceEEC recent', 'osu SpaceEEC taiko']
		});

		this.modes = ['osu', 'taiko', 'ctb', 'mania'];
	}

	run(message, [query, modeOrOption, option], { authorModel }) {
		if (!query) {
			return message.reply('you have to tell me who you want to look up!');
		}

		let mode = 0;
		if (modeOrOption) {
			modeOrOption = modeOrOption.toLowerCase();
			let index = this.modes.indexOf(modeOrOption);
			if (index !== -1) mode = index;
			else option = modeOrOption;
		}

		if (option) {
			option = option.toLowerCase();
			if (['best', 'recent'].includes(option)) {
				return this.fetchScores(message, authorModel, query, mode, option);
			}

			return message.reply('that is not a valid option');
		}

		return this.fetch(message, authorModel, mode, query);
	}

	async fetchScores(message, authorModel, query, mode, type) {
		const user = await User.fetch(query);
		if (!user) return message.reply('I could not find any user matching your query.');

		const scores = await user[`fetch${type[0].toUpperCase() + type.slice(1)}`]({ mode });
		if (!scores.length) return message.reply(`I could not find any ${type} scores!`);

		const embed = this.embed(message, authorModel, user);

		for (const score of scores) {
			const { _beatmap: beatmap } = score;
			const mods = score.enabledMods;
			embed.addField(
				`${score._beatmap.artist} - ${beatmap.title} [${beatmap.version}]${mods ? ` +${mods}` : ''}`,
				`${score.rank} -- [URL](${beatmap.versionURL()}) -- ${score.date.fromNow()} -- **${score.pp.toFixed(2)}pp**`
			);
		}

		return message.channel.send(embed);
	}

	async fetch(message, authorModel, mode, query) {
		const user = await User.fetch(query, mode);
		if (!user) return message.reply('I could not find any user matching your query.');

		const embed = this.embed(message, authorModel, user)
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

	embed(message, authorModel, user) {
		return RichEmbed.common(message, authorModel)
			.setAuthor(user.username, user.iconURL, user.profileURL)
			.setDescription(user.countryFlag);
	}
}

module.exports = OsuUserCommand;
