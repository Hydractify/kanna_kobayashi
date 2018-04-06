import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { fetchRandom } from '../../structures/weeb';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { RandomImageResult } from '../../types/weeb/RandomImageResult';
import { chunkArray } from '../../util/Util';

class ImageCommand extends Command {
	/**
	 * The allowed types to be requested to weeb.sh
	 */
	private types: string[] = [
		'awoo',
		'clagwimoth',
		'insult',
		'lewd',
		'insult',
		'megumin',
		'neko',
		'nom',
		'owo',
		'pout',
		'shrug',
		'slap',
		'sleepy',
		'smile',
		'teehee',
		'smug',
		'thumbsup',
		'triggered',
		'wag',
		'wasted',
		'dab',
		'banghead',
		'nani',
		'initial_d',
		'delet_this',
		'poi',
		'thinking',
		'greet',
		'handholding',
	];

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['weeb', 'images'],
			clientPermissions: ['EMBED_LINKS'],
			coins: true,
			description: 'Get an image from the weeb.sh API!',
			examples: ['weeb smug', 'weeb types'],
			name: 'image',
			usage: 'image <ImageType|\'types\'>',
		});
	}

	public async parseArgs(message: Message, [input]: string[]): Promise<string | [string]> {
		if (!input) return ['types'];
		input = input.toLowerCase();
		if (input === 'types' || this.types.includes(input)) return [input];

		return `${input} is not a valid image type! (\`${this.usage}\`)`;
	}

	public async run(
		message: Message,
		[type]: [string],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel);
		if (type === 'types') {
			const types: string = chunkArray(this.types, 3)
				.map((chunk: string[]) => chunk.join(', '))
				.join(',\n');

			embed
				.setAuthor('Image Types', message.author.displayAvatarURL())
				.setDescription(types);
		} else {
			const image: RandomImageResult = await fetchRandom({ type });

			embed.setImage(image.url);
		}

		return message.reply(embed);
	}
}

export { ImageCommand as Command };
