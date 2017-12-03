import { DiscordAPIError, Message } from 'discord.js';

import { Quiz } from '../../models/Quiz';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';
import { titleCase } from '../../util/Util';

class QuizPhotoCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['qphoto'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Change or view the photo of the current quiz character!',
			examples: [
				'quizphoto set https://static.comicvine.com/uploads/original/11120/111201214/4317240-azua3.jpg',
				'quizphoto view',
			],
			exp: 0,
			name: 'quizpphoto',
			usage: 'quizphoto <set|view> [URL]',
			permLevel: PermLevels.DRAGONTAMER,
		});
	}

	public parseArgs(message: Message, [option, photo]: string[]): string | ['view' | 'set', string] {
		if (!option) {
			return [
				'you also need to tell me whether you want to',
				'`set` a new photo, or `view` the current one?',
			].join(' ');
		}

		option = option.toLowerCase();

		if (option === 'view') return ['view', undefined];

		if (option === 'set') {
			if (!photo) return 'you need to give me the url to a picture of the character you want to set.';

			// Can't validate the url without sending a message which I want to avoid here
			return ['set', photo];
		}

		return 'that is not a valid option, valid options are `set` and `view`.';
	}

	public async run(
		message: Message,
		[option, photo]: ['view' | 'set', string],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const quiz: Quiz = await message.guild.model.$get<Quiz>('quiz') as Quiz;

		if (option === 'view') {
			if (!quiz) return message.reply('there is no quiz set up.');

			return message.channel.send(
				MessageEmbed.common(message, authorModel)
					.setTitle('Current Quiz:')
					.setDescription(quiz.name ? titleCase(quiz.name) : 'No name set up yet')
					.setImage(quiz.photo),
			);
		}

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setTitle('Setting up photo...')
			.setImage(photo);

		const confirmMessage: Message | DiscordAPIError = await (message.channel.send(embed) as Promise<Message>)
			.catch((error: DiscordAPIError) => error);

		if (confirmMessage instanceof DiscordAPIError) {
			if (confirmMessage.code !== 50035) {
				// Some other error occured, abort here.
				throw confirmMessage;
			}

			return message.reply('this does not look like a valid photo url.');
		}

		if (quiz) {
			quiz.photo = photo;
			await quiz.save();
		} else {
			await message.guild.model.$create('quiz', {
				guildId: message.guild.id,
				photo,
			});
		}

		embed.setTitle(`Set picture of ${(quiz && quiz.name) ? titleCase(quiz.name) : '\'No name set up yet\''}`);

		return confirmMessage.edit(embed);
	}
}

export { QuizPhotoCommand as Command };
