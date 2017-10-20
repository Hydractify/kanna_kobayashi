const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase } = require('../../util/Util');

class QuizNameCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['qname'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Change or view the name of the current quiz character!',
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

	async run(message, [option, ...name], { authorModel }) {
		if (!option) {
			return message.reply([
				'you also need to tell me whether you want to',
				'`set` a new name, or `view` the current one?'
			].join(' '));
		}

		option = option.toLowerCase();

		if (option === 'view') {
			const quiz = await message.guild.model.getQuiz();
			if (!quiz) return message.reply('there is no quiz set up.');
			if (!quiz.name) {
				return message.reply(`the set up quiz has no answer associated with it.`);
			}

			if (quiz.photo) {
				const embed = RichEmbed.common(message, authorModel)
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
				return message.reply(`to set a name, you have to specify one.`);
			}

			let toSend;
			const quiz = await message.guild.model.getQuiz();
			if (quiz) {
				quiz.name = name.join(' ');
				await quiz.save();
				if (quiz.photo) {
					toSend = RichEmbed.common(message, authorModel)
						.setTitle(titleCase(quiz.name))
						.setImage(quiz.photo);
				}
			} else {
				await message.guild.model.createQuiz({
					guildId: message.guild.id,
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

		return message.reply('that is not a valid option. Valid options are `set` and `view`.');
	}
}

module.exports = QuizNameCommand;
