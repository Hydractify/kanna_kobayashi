import { Collection, CollectorFilter, Message, Snowflake } from 'discord.js';

import { Quiz } from '../../models/Quiz';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';
import { titleCase } from '../../util/Util';

class QuizStartCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['qstart'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Starts a quiz event',
			examples: ['qstart'],
			name: 'quizstart',
			permLevel: PermLevels.DRAGONTAMER,
			usage: 'qstart',
		});
	}

	public async run(message: Message, args: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const quiz: Quiz = await message.guild.model.$get<Quiz>('quiz') as Quiz;
		if (!quiz || !quiz.name || !quiz.photo) {
			return message.reply([
				'this guild does not have a quiz set up!',
				'You can use one of the a pre made ones,'
				+ ' or add your own by setting a photo and an answer! <:kannaShy:458779242696540170>',
			].join('\n'));
		}

		const eventEmbed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`${message.author.tag} started an event!`)
			.setImage(quiz.photo)
			.addField('Who is this character?', `You have ${quiz.duration} minutes to answer!`);

		const eventMessage: Message = await message.channel.send(eventEmbed) as Message;

		const [firstName, ...lastNameArray]: string[] = quiz.name.split(/ +/);
		const lastName: string = lastNameArray.join(' ');

		const filter: CollectorFilter = (msg: Message): boolean => {
			const content: string = msg.content.toLowerCase();

			return content.startsWith(firstName)
				|| (lastName && content.startsWith(lastName));
		};

		const answer: Message = await message.channel.awaitMessages(filter, { max: 1, time: quiz.duration * 6e4 })
			.then((collected: Collection<Snowflake, Message>) => collected.first());

		eventEmbed.fields[0].value = `~~${eventEmbed.fields[0].value}~~ Time is over!`;
		await eventMessage.edit(eventEmbed).catch(() => undefined);

		eventEmbed.fields[0] = {
			name: 'Character name',
			value: titleCase(quiz.name),
		};

		eventEmbed.author = null;

		eventEmbed.setTitle(
			answer
				? `${answer.author.tag} won the event!`
				: 'No one guessed it right.',
		);

		return message.channel.send(eventEmbed);
	}
}

export { QuizStartCommand as Command };
