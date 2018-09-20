import { Message } from 'discord.js';

import { AniListCommand } from '../../structures/AniListCommand';
import { CommandHandler } from '../../structures/CommandHandler';
import { IMedia } from '../../types/anilist/IMedia';
import { MediaType } from '../../types/anilist/MediaType';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class AnimeCommand extends AniListCommand<IMedia> {
	public constructor(handler: CommandHandler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Search for a specific anime on anilist',
			examples: ['anime Miss Kobayashi\'s Dragon Maid'],
			type: MediaType.ANIME,
			usage: 'anime <...Search>',
		});
	}

	public parseArgs(message: Message, args: string[]): string | string[] {
		if (!args.length) return 'you have to tell me what anime you are looking for!';

		return args;
	}

	public async run(
		message: Message,
		args: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const entries: IMedia[] | undefined = await this.search(args.join(' '));

		if (!entries) return message.reply('I could not find a single anime matching your search!');

		const entry: IMedia | undefined = entries.length > 1
			? await this.pick(message, authorModel, entries)
			: entries[0];

		if (!entry) return message.reply('aborting then.');

		return message.channel.send(
			this.buildEmbed(message, authorModel, entry),
		);
	}
}

export { AnimeCommand as Command };
