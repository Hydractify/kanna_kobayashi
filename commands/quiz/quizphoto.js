const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase } = require('../../util/Util');

class QuizPhotoCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['qphoto'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Change or view the photo of the current quiz character!',
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

	async run(message, [option, photo], { authorModel }) {
		if (!option) {
			return message.reply([
				'you also need to tell me whether you want to',
				'`set` a new photo, or `view` the current one?'
			].join(' '));
		}

		option = option.toLowerCase();

		if (option === 'view') {
			const quiz = await message.guild.model.getQuiz();
			if (!quiz) return message.reply('there is no quiz set up.');
			if (!quiz.photo) {
				return message.reply('the set up quiz has no character photo associated with it.');
			}

			const embed = RichEmbed.common(message, authorModel)
				.setTitle('Current Quiz:')
				.setDescription(quiz.name ? titleCase(quiz.name) : 'No name set up yet')
				.setImage(quiz.photo);

			return message.channel.send(embed);
		}

		if (option === 'set') {
			if (!photo) {
				return message.reply(`you need to give me the url to a picture of the charactor you want to set.`);
			}

			let quiz = await message.guild.model.getQuiz();

			const embed = RichEmbed.common(message, authorModel)
				.setTitle('Setting up photo...')
				.setImage(photo);

			const confirmMessage = await message.channel.send(embed).catch(error => error);

			if (confirmMessage instanceof Error) {
				if (confirmMessage.message.split('\n')[0] !== 'Invalid Form Body') {
					// Some other error occured, abort here.
					throw confirmMessage;
				}

				return message.reply('this does not look like a valid photo url.');
			}

			if (quiz) {
				quiz.photo = photo;
				await quiz.save();
			} else {
				await message.guild.model.createQuiz({
					guildId: message.guild.id,
					photo
				});
			}

			embed.setTitle(`Set picture of ${quiz && quiz.name ? titleCase(quiz.name) : '\'No name set up yet\''}`);

			return confirmMessage.edit(embed);
		}

		return message.reply('that is not a valid option, valid options are `set` and `view`.');
	}
}

module.exports = QuizPhotoCommand;
