const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase } = require('../../util/Util');

class QuizPhotoCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['qphoto'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Choose one of the pre made quizzes of 10 characters from the series.',
			examples: [
				'quizphoto set https://static.comicvine.com/uploads/original/11120/111201214/4317240-azua3.jpg',
				'quizphoto view'
			],
			exp: 0,
			name: 'quizpphoto',
			usage: 'quizphoto <set|view> [URL]',
			permLevel: 1
		});
	}

	async run(message, [option, photo]) {
		if (!option) {
			return message.channel.send(
				`${message.author}, do you want to \`set\` a new photo, or \`view\` the current one?`
			);
		}

		option = option.toLowerCase();

		if (option === 'view') {
			const quiz = await message.guild.model.getQuiz();
			if (!quiz) return message.channel.send(`${message.author}, there is no quiz set up.`);
			if (!quiz.photo) {
				return message.channel.send(`${message.author}, the set up quiz has no character photo associated with it.`);
			}

			const embed = RichEmbed.common(message)
				.setTitle('Current Quiz:')
				.setDescription(quiz.name ? titleCase(quiz.name) : 'No name set up yet')
				.setImage(quiz.photo);

			return message.channel.send(embed);
		}

		if (option === 'set') {
			if (!photo) {
				return message.channel.send(`You need to give me the url to a picture of the charactor you want to set.`);
			}

			let quiz = await message.guild.model.getQuiz();

			const embed = RichEmbed.common(message)
				.setTitle('Setting up photo...')
				.setImage(photo);

			const confirmMessage = await message.channel.send(embed).catch(error => error);

			if (confirmMessage instanceof Error) {
				if (confirmMessage.message.split('\n')[0] !== 'Invalid Form Body') {
					// Some other error occured, abort here.
					throw confirmMessage;
				}

				return message.channel.send('This does not look like a valid photo url.');
			}

			if (quiz && !quiz.preMade) {
				quiz.photo = photo;
				await quiz.save();
			} else {
				await message.guild.model.createQuiz({
					quizId: message.guild.id,
					photo
				});
			}

			embed.setTitle(`Set picture of ${(quiz && quiz.name) ? titleCase(quiz.name) : '\'No name set up yet\''}`);

			return confirmMessage.edit(embed);
		}

		return message.channel.send('Unknown option, valid options are `set` and `view`.');
	}
}

module.exports = QuizPhotoCommand;
