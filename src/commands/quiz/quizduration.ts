import { Message } from 'discord.js';

import { Quiz } from '../../models/Quiz';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';
import { resolveDuration } from '../../util/Util';

class QuizDurationCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['qduration'],
			description: 'Change or view the selected duration of the quiz!',
			examples: [
				'qduration view',
				'qduration set 5 // Is in minutes',
				'qduration set 5m',
				'qduration set 1h30m',
			],
			permLevel: PermLevels.DRAGONTAMER,
			usage: 'quizduration <\'view\'|\'set\'> [Minutes]',
		});
	}

	public parseArgs(message: Message, [option, ...time]: string[]): string | ['set', number] | ['view', undefined] {
		if (!option) {
			return [
				'you need to tell me whether you want to',
				'`set` a new duration, or `view` the current one.',
			].join(' ');
		}

		option = option.toLowerCase();

		if (option === 'view') return ['view', undefined];

		if (option === 'set') {
			if (!time) return 'you also need to tell me how long quizzes should be.';

			const parsed: number = resolveDuration(time.join(' '));

			if (isNaN(parsed)) return 'that does not look like a valid number!';

			if (parsed <= 0) return 'I don\'t think a number smaller than 1 will do.';

			return ['set', parsed];
		}

		return 'that is not a valid option, valid options are `view` and `set`.';

	}

	public async run(
		message: Message,
		[option, time]: ['set', number] | ['view', undefined],
	): Promise<Message | Message[]> {
		const quiz: Quiz = await message.guild.model.$get<Quiz>('quiz') as Quiz;

		if (option === 'view') {
			if (!quiz) return message.reply('there is no quiz set up.');

			return message.reply(
				`the current length of quizzes are ${quiz.duration} minute${quiz.duration === 1 ? '' : 's'}.`,
			);
		}

		if (quiz) {
			quiz.duration = time!;
			await quiz.save();
		} else {
			await message.guild.model.$create('quiz', {
				duration: time,
				guildId: message.guild.id,
			});
		}

		return message.reply(
			`you successfully ${quiz ? 'updated' : 'set'} the time of quizzes to ${time} minutes!`,
		);
	}
}

export { QuizDurationCommand as Command };
