import { Message } from 'discord.js';

import { Quiz } from '../../models/Quiz';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';

class QuizDurationCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['qduration'],
			coins: 0,
			description: 'Change or view the selected duration of the quiz!',
			examples: [
				'qduration view',
				'qduration set 5 // Is in minutes',
			],
			exp: 0,
			name: 'quizduration',
			permLevel: PermLevels.DRAGONTAMER,
			usage: 'quizduration <\'view\'|\'set\'> [Minutes]',
		});
	}

	public parseArgs(message: Message, [option, time]: string[]): string | ['view' | 'set', number] {
		if (!option) {
			return [
				'you also need to tell me whether you want to',
				'`set` a new duration, or `view` the current one?',
			].join(' ');
		}

		option = option.toLowerCase();

		if (option === 'view') return ['view', undefined];

		if (option === 'set') {
			if (!time) return 'you also need to tell me how long quizzes should be.';

			const parsed: number = parseInt(time.replace(/(m|minutes?)$/i, '').trim());

			if (isNaN(parsed)) return 'that does not look like a valid number!';

			if (parsed <= 0) return 'the duration must be larger than 0!';

			return ['set', parsed];
		}

		return 'that is not a valid option, valid options are `view` and `set`.';

	}

	public async run(
		message: Message,
		[option, time]: ['view' | 'set', number],
	): Promise<Message | Message[]> {
		const quiz: Quiz = await message.guild.model.$get<Quiz>('quiz') as Quiz;

		if (option === 'view') {
			if (!quiz) return message.reply(`there is no quiz set up.`);

			return message.reply(
				`the current length of quizzes are ${quiz.duration} minute${quiz.duration === 1 ? '' : 's'}.`,
			);
		}

		if (quiz) {
			quiz.duration = time;
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
