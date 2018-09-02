import { Collection, CollectorFilter, Message, MessageReaction, Snowflake, User } from 'discord.js';

import { Quiz } from '../../models/Quiz';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';

class QuizPremadeCommand extends Command {

	private emojis: string[] = [
		'KannaMad:315264558279426048',
		'1%E2%83%A3',
		'2%E2%83%A3',
		'3%E2%83%A3',
		'4%E2%83%A3',
		'5%E2%83%A3',
		'6%E2%83%A3',
		'7%E2%83%A3',
		'8%E2%83%A3',
		'9%E2%83%A3',
	];

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['qpremade'],
			clientPermissions: ['ADD_REACTIONS', 'EMBED_LINKS', 'USE_EXTERNAL_EMOJIS'],
			description: 'Choose one of the pre made quizzes of 10 characters from the series',
			examples: ['quizpremade'],
			name: 'quizpremade',
			permLevel: PermLevels.DRAGONTAMER,
			usage: 'quizpremade',
		});
	}

	public async run(message: Message, args: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setTitle('Take your pick!')
			.setDescription('This will replace the current set up quiz in this guild.')
			.addField(
			'Dragons',
			[
				'<:kannaMad:458776169924526093> **Ilulu**',
				':one: **Tohru**',
				':two: **Quetzalcoatl**',
				':three: **Fafnir**',
				':four: **Elma**',
				':five: **Kanna Kamui**',
			],
			true,
		)
			.addField(
			'Humans',
			[
				':six: **Kobayashi**',
				':seven: **Makoto Takiya**',
				':eight: **Magatsuchi Shouta**',
				':nine: **Saikawa Riko**',
			],
			true,
		)
			.setThumbnail(message.guild.iconURL());

		const pickMessage: Message = await message.channel.send(embed) as Message;

		for (const emoji of this.emojis) {
			await pickMessage.react(emoji);
		}

		const filter: CollectorFilter = ({ emoji: { identifier } }: MessageReaction, user: User): boolean =>
			user.id === message.author.id && this.emojis.includes(identifier);

		const reactions: Collection<Snowflake, MessageReaction> =
			await pickMessage.awaitReactions(filter, { max: 1, time: 6e4 });
		pickMessage.delete().catch(() => undefined);
		if (!reactions.size) return undefined;

		const already: Quiz = await message.guild.model.$get<Quiz>('quiz') as Quiz;
		const quiz: {
			name: string;
			photo: string;
		} = Quiz.preMade[this.emojis.indexOf(reactions.first().emoji.identifier)];
		if (already) {
			already.set(quiz);
			await already.save();
		} else {
			await message.guild.model.$create('quiz', { guildId: message.guild.id, ...quiz });
		}

		return message.channel.send(
			MessageEmbed.common(message, authorModel)
				.setTitle('Set your quiz to:')
				.setDescription(quiz.name)
				.setImage(quiz.photo),
		);
	}
}

export { QuizPremadeCommand as Command };
