import { Message } from 'discord.js';

import { AniListCommand } from '../../structures/AniListCommand';
import { CommandHandler } from '../../structures/CommandHandler';
import { AnimeData } from '../../types/anilist/AnimeData';
import { AniType } from '../../types/anilist/AniType';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class AnimeCommand extends AniListCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Search for a specific anime on anilist',
			examples: ['anime Miss Kobayashi\'s Dragon Maid'],
			name: 'anime',
			type: AniType.ANIME,
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
		const entries: AnimeData[] = await this.search<AnimeData>(args.join(' '));

		if (!entries) return message.reply('I could not find a single anime matching your search!');

		const entry: AnimeData = entries.length > 1
			? await this.pick(message, authorModel, entries)
			: entries[0];

		if (!entry) return message.reply('aborting then.');

		return message.channel.send(
			this.buildEmbed(message, authorModel, entry),
		);
	}
}

export { AnimeCommand as Command };
