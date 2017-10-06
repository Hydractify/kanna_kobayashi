const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase } = require('../../util/Util');

class QuizStartCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['qstart'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Starts a quiz event.',
			examples: ['qstart'],
			exp: 0,
			name: 'quizstart',
			usage: 'qstart',
			permLevel: 1
		});
	}

	async run(message) {
		const quiz = await message.guild.model.getQuiz();
		if (!quiz || !quiz.name || !quiz.photo) {
			return message.channel.send([
				'This guild does not have a quiz set up!',
				'You can use one of the a pre made oned, or addi your own by setting a photo and an answer.'
			]);
		}

		const eventEmbed = RichEmbed.common(message)
			.setAuthor(`${message.author.tag} started an event!`)
			.setImage(quiz.photo)
			.addField('Who is this character?', 'You have 15 minutes to answer');

		const eventMessage = await message.channel.send(eventEmbed);

		let [firstname, ...lastname] = quiz.name.split(/ +/);
		lastname.join(' ');

		const filter = msg => {
			const content = msg.content.toLowerCase();

			return content.startsWith(firstname)
				|| (lastname && content.startsWith(lastname));
		};

		const collected = await message.channel.awaitMessages(filter, { max: 1, time: 15 * 60 * 1000 });

		eventEmbed.fields[0].value = `~~${eventEmbed.fields[0].value}~~ Time is over!`;
		await eventMessage.edit(eventEmbed).catch(() => null);

		eventEmbed.fields[0] = {
			name: 'Character name',
			value: titleCase(quiz.name)
		};

		eventEmbed.author = null;

		eventEmbed.setTitle(
			collected.size
				? `${collected.first().author.tag} won the event!`
				: 'No one guessed it right.'
		);

		return message.channel.send(eventEmbed);
	}
}

module.exports = QuizStartCommand;
