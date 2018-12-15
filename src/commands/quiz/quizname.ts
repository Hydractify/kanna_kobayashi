import { Message } from 'discord.js';

import { Quiz } from '../../models/Quiz';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';
import { titleCase } from '../../util/Util';

class QuizNameCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['qname'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Change or view the name of the current quiz character!',
			examples: [
				'quizname view',
				'quizname set Dio Brando',
			],
			exp: 0,
			permLevel: PermLevels.DRAGONTAMER,
			usage: 'quizname <set|view> [...Name]',
		});
	}

	public parseArgs(message: Message, [option, ...name]: string[]): string | ['set', string] | ['view', undefined] {
		if (!option) {
			return [
				'you need to tell me whether you want to',
				'`set` a new name, or `view` the current one?',
			].join(' ');
		}

		option = option.toLowerCase();

		if (option === 'view') return ['view', undefined];

		if (option === 'set') {
			if (!name.length) return 'to set a name, you have to specify one.';

			return ['set', name.join(' ')];
		}

		return 'that is not a valid option. Valid options are `set` and `view`.';
	}

	public async run(
		message: Message,
		[option, name]: ['set', string] | ['view', undefined],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const quiz: Quiz = await message.guild.model.$get<Quiz>('quiz') as Quiz;
		if (option === 'view') {
			if (!quiz) return message.reply('there is no quiz set up.');
			if (!quiz.name) {
				return message.reply('the set up quiz has no answer associated with it.');
			}

			if (quiz.photo) {
				const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
					.setTitle('Current quiz:')
					.setDescription(titleCase(quiz.name))
					.setImage(quiz.photo);

				return message.channel.send(embed);
			}

			return message.channel.send([
				`Answer of the current quiz: ${quiz.name}`,
				'_There is no photo associated with this quiz!_',
			]);
		}

		let toSend: string[] | MessageEmbed | undefined;
		if (quiz) {
			quiz.name = name!;
			await quiz.save();
			if (quiz.photo) {
				toSend = MessageEmbed
					.common(message, authorModel)
					.setTitle(titleCase(quiz.name))
					.setImage(quiz.photo);
			}
		} else {
			await message.guild.model.$create('quiz', {
				guildId: message.guild.id,
				name,
			});
		}

		if (!toSend) {
			toSend = [
				`Set the answer to \`${titleCase(name!)}\`.`,
				'_There is no photo associated with this quiz!_',
			];
		}

		return message.channel.send(toSend);
	}
}

export { QuizNameCommand as Command };
