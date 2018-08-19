import { Message } from 'discord.js';
import { get, Result } from 'snekfetch';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IUrbanDictionaryResponse } from '../../types/IUrbanDictionaryResponse';
import { titleCase } from '../../util/Util';

class UrbanCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Look up a definition for a term on urbandictonary',
			examples: ['urban test'],
			name: 'urban',
			usage: 'urban <...Term>',
		});
	}

	public parseArgs(message: Message, args: string[]): string | string[] {
		if (!args.length) {
			return [
				'you are supposed to tell me a term to lookup!',
				`(\`kanna ${this.usage}\`) <:kannaScared:458776266154180609>`,
			].join(' ');
		}

		return [titleCase(args.join(' ')), encodeURIComponent(args.join('+').replace(/%2B/g, '+'))];
	}

	public async run(
		message: Message,
		[original, query]: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const { body: { list } }: Result<IUrbanDictionaryResponse> = await get(
			`http://api.urbandictionary.com/v0/define?term=${query}`,
		);

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(
			`Search result for ${original}`,
			'https://d2gatte9o95jao.cloudfront.net/assets/store-mug-example-256@2x-34cb1d3724cbce5ce790228b5bf8eabe.png',
		)
			.setDescription('\u200b')
			.setThumbnail(message.guild.iconURL());
		embed.footer.text += ' | Powered by urbandictionary';

		if (!list.length) {
			embed.addField('No results', 'Maybe made a typo?')
				.addField('Search:', `[URL](http://www.urbandictionary.com/define.php?term=${query})`);

			return message.channel.send(embed);
		}

		const {
			author,
			definition,
			example,
			thumbs_up: thumbsUp,
			thumbs_down: thumbsDown,
		} = list[0];

		embed.addField('Author', author)
			.splitToFields('Definition', definition);

		if (example) {
			embed.splitToFields('Example', example);
		}

		embed.addField('Thumbs Up <:kannaWow:458777326810038292>', thumbsUp, true)
			.addField('Thumbs Down <:kannaMad:458776169924526093>', thumbsDown, true);

		return message.channel.send(embed);
	}
}

export { UrbanCommand as Command };
