const Command = require('../../structures/Command');

class QuizDurationCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['qduration'],
			clientPermissions: [],
			coins: 0,
			enabled: true,
			description: 'Change or view the selected duration of the quiz!',
			examples: [
				'qduration view',
				'qduration set 5 // Is in minutes'
			],
			exp: 0,
			name: 'quizduration',
			usage: 'quizduration <\'view\'|\'set\'> [minutes]',
			permLevel: 1
		});
	}

	async run(message, [option, time]) {
		if (!option) {
			return message.reply([
				'you also need to tell me whether you want to',
				'`set` a new name, or `view` the current one?'
			].join(' '));
		}

		option = option.toLowerCase();

		if (option === 'view') {
			const quiz = await message.guild.model.getQuiz();
			if (!quiz) return message.reply(`there is no quiz set up.`);

			return message.reply(
				`the current length of a quiz is ${quiz.duration} minute${quiz.duration === 1 ? '' : 's'}.`
			);
		}

		if (option === 'set') {
			if (!time) {
				return message.reply('you also need to tell me how long the quizzes should be.');
			}
			// Allow 5m / 5minutes / 1minute to be used. UX and stuff
			time = parseInt(time.replace(/(m$|minutes?$)/i, '').trim());

			if (isNaN(time)) return message.reply('that does not look like a number!');
			if (time <= 0) {
				return message.reply('duration must be a whole number larger than 0!');
			}

			const quiz = await message.guild.model.getQuiz();
			if (quiz) {
				quiz.duration = time;
				await quiz.save();
			} else {
				await message.guild.model.createQuiz({
					guildId: message.guild.id,
					duration: time
				});
			}

			return message.reply(
				`successfully ${quiz ? 'updated' : 'set'} the time of quizzes to ${time} minutes!`
			);
		}

		return message.reply('that is not a valid option, valid options are `view` and `set`.');
	}
}

module.exports = QuizDurationCommand;
