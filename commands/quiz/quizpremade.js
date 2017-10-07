const { preMade } = require('../../models/Quiz');
const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

class QuizPremadeCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['qpremade'],
			clientPermissions: ['ADD_REACTIONS', 'EMBED_LINKS'],
			coins: 0,
			description: 'Choose one of the pre made quizzes of 10 characters from the series.',
			examples: ['quizpremade'],
			exp: 0,
			name: 'quizpremade',
			usage: 'quizpremade',
			permLevel: 1
		});

		this.emojis = [
			'KannaOmfg:315264558279426048',
			'1%E2%83%A3',
			'2%E2%83%A3',
			'3%E2%83%A3',
			'4%E2%83%A3',
			'5%E2%83%A3',
			'6%E2%83%A3',
			'7%E2%83%A3',
			'8%E2%83%A3',
			'9%E2%83%A3'
		];
	}

	async run(message) {
		const embed = RichEmbed.common(message)
			.setTitle('Take your pick!')
			.setDescription('This will replace the current set up quiz in this guild.')
			.addField(
				'Dragons',
				[
					'<:KannaMad:315264558279426048> **Ilulu**',
					':one: **Tohru**',
					':two: **Quetzalcoatl**',
					':three: **Fafnir**',
					':four: **Elma**',
					':five: **Kanna Kamui**'
				],
				true
			)
			.addField(
				'Humans',
				[
					':six: **Kobayashi**',
					':seven: **Makoto Takiya**',
					':eight: **Magatsuchi Shouta**',
					':nine: **Saikawa Riko**'
				],
				true
			)
			.setThumbnail(message.guild.iconURL);

		const pickMessage = await message.channel.send(embed);

		for (const emoji of this.emojis) {
			// eslint-disable-next-line no-await-in-loop
			await pickMessage.react(emoji);
		}

		const filter = ({ emoji: { identifier } }, user) =>
			user.id === message.author.id && this.emojis.includes(identifier);

		const reactionCollector = pickMessage.createReactionCollector(filter, { max: 1, time: 60 * 1000 })
			.on('collect', async ({ emoji: { identifier } }) => {
				reactionCollector.stop();

				const index = this.emojis.indexOf(identifier);

				// Delete an already existing quiz if it's not premade
				const already = await message.guild.model.getQuiz();
				if (already && !already.preMade) {
					await already.destroy();
				}

				await message.guild.model.setQuiz(String(index));

				const [name, photo] = preMade[index];
				return message.channel.send(
					RichEmbed.common(message)
						.setTitle('Set your quiz to:')
						.setDescription(name)
						.setImage(photo)
				);
			})
			.on('end', () => pickMessage.delete().catch(() => null));
	}
}

module.exports = QuizPremadeCommand;
