const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase } = require('../../util/Util');

class QuizNameCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['qname'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Change the name of the quiz character!',
			example: [
				'quizname view',
				'quizname set Dio Brando'
			],
			exp: 0,
			name: 'quizname',
			usage: ['quizname <set|view> [...Name]'],
			permLevel: 1
		});
	}

	async run(message, [option, ...name]) {
		if (!option) {
			return message.channel.send(
				`${message.author}, do you want to \`set\` a new name, or \`view\` the current one?`
			);
		}

		option = option.toLowerCase();

		if (option === 'view') {
			const quiz = await message.guild.model.getQuiz();
			if (!quiz) return message.channel.send(`${message.author}, there is no quiz set up.`);
			if (!quiz.name) {
				return message.channel.send(`${message.author}, the set up quiz has no answer associated with it.`);
			}

			if (quiz.photo) {
				const embed = RichEmbed.common(message)
					.setTitle('Current quiz:')
					.setDescription(titleCase(quiz.name))
					.setImage(quiz.photo);

				return message.channel.send(embed);
			}

			return message.channel.send([
				`Answer of the current quiz: ${quiz.name}`,
				'_There is no photo associated with this quiz!_'
			]);
		}

		if (option === 'set') {
			if (!name.length) {
				return message.channel.send(`To set a name, you have to specify one, ${message.author}.`);
			}

			let toSend;
			const quiz = await message.guild.model.getQuiz();
			if (quiz && !quiz.preMade) {
				quiz.name = name.join(' ');
				await quiz.save();
				if (quiz.photo) {
					toSend = RichEmbed.common(message)
						.setTitle(titleCase(quiz.name))
						.setImage(quiz.photo);
				}
			} else {
				await message.guild.model.createQuiz({
					quizId: message.guild.id,
					name: name.join(' ')
				});
			}

			if (!toSend) {
				toSend = [
					`Set the answer to \`${titleCase(name.join(' '))}\`.`,
					'_There is no photo associated with this quiz!_'
				];
			}

			return message.channel.send(toSend);
		}

		return message.channel.send('Unknown option, valid options are `set` and `view`.');
	}
}

module.exports = QuizNameCommand;
