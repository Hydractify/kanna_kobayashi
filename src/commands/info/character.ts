import { Message } from 'discord.js';

import { AniListCommand } from '../../structures/AniListCommand';
import { CommandHandler } from '../../structures/CommandHandler';
import { AniType } from '../../types/anilist/AniType';
import { CharData } from '../../types/anilist/CharData';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class AnimeCommand extends AniListCommand {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['char'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Search for a specific character on anilist',
			examples: ['character Kanna Kamui'],
			name: 'character',
			type: AniType.CHARACTER,
			usage: 'character <...Search>',
		});
	}

	public parseArgs(message: Message, args: string[]): string | string[] {
		if (!args.length) return 'you have to tell me what character you are looking for!';

		return args;
	}

	public async run(message: Message, args: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const entries: CharData[] = await this.search<CharData>(args.join(' '));

		if (!entries) return message.reply('I could not find a single character matching your search!');

		const entry: CharData = entries.length > 1
			? await this.pick(message, authorModel, entries)
			: entries[0];

		if (!entry) return message.reply('aborting then.');

		return message.channel.send(
			this.buildEmbed(message, authorModel, entry),
		);
	}
}

export { AnimeCommand as Command };
