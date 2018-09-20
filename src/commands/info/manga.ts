import { Message } from 'discord.js';

import { AniListCommand } from '../../structures/AniListCommand';
import { CommandHandler } from '../../structures/CommandHandler';
import { IMedia } from '../../types/anilist/IMedia';
import { MediaType } from '../../types/anilist/MediaType';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class MangaCommand extends AniListCommand<IMedia> {
	public constructor(handler: CommandHandler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Search for a specific manga on anilist',
			examples: ['manga Miss Kobayashi\'s Dragon Maid'],
			type: MediaType.MANGA,
			usage: 'manga <...Search>',
		});
	}

	public async run(message: Message, args: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		if (!args.length) return message.reply('you have to tell me what manga you are looking for!');

		const entries: IMedia[] | undefined = await this.search(args.join(' '));

		if (!entries) return message.reply('I could not find a single manga matching your search!');

		const entry: IMedia | undefined = entries.length > 1
			? await this.pick(message, authorModel, entries)
			: entries[0];

		if (!entry) return message.reply('aborting then.');

		return message.channel.send(
			this.buildEmbed(message, authorModel, entry),
		);
	}
}

export { MangaCommand as Command };
