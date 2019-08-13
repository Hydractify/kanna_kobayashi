import { Message } from 'discord.js';

import { AniListCommand } from '../../structures/AniListCommand';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICharacter } from '../../types/anilist/ICharacter';
import { MediaType } from '../../types/anilist/MediaType';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class CharacterCommand extends AniListCommand<ICharacter> {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['char'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Search for a specific character on anilist',
			examples: ['character Kanna Kamui'],
			type: MediaType.CHARACTER,
			usage: 'character <...Search>',
		});
	}

	public parseArgs(message: GuildMessage, args: string[]): string | string[] {
		if (!args.length) return 'you have to tell me what character you are looking for!';

		return args;
	}

	public async run(
		message: GuildMessage,
		args: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const entries: ICharacter[] | undefined = await this.search(args.join(' '));

		if (!entries) return message.reply('I could not find a single character matching your search!');

		const entry: ICharacter | undefined = entries.length > 1
			? await this.pick(message, authorModel, entries)
			: entries[0];

		if (!entry) return message.reply('aborting then.');

		return message.channel.send(
			this.buildEmbed(message, authorModel, entry),
		);
	}
}

export { CharacterCommand as Command };
