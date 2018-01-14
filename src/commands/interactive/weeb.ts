import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { fetchRandom } from '../../structures/weeb';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IResult } from '../../types/weeb/IResult';
import { RandomImageResult } from '../../types/weeb/RandomImageResult';

class WeebCommand extends Command {
	/**
	 * The allowed types to be requested to weeb.sh
	 */
	private types: string[];
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['images'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Get an image from the weeb.sh API!',
			examples: ['weeb smug', 'weeb types'],
			name: 'weeb',
			usage: 'weeb <Image|\'types\'>',
		});
		this.types = [
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
	}

	public async parseArgs(message: Message, [input]: string[]): Promise<string | string[] | IResult[]> {
		if (input === 'types') return ['types'];

		if (this.types.includes(input)) {
			const typeIndex: number = this.types.indexOf(input);
			const image: IResult = await fetchRandom({ type: this.types[typeIndex]});
			return [image];
		}

		return `${input} is not a valid image nor method! (\`${this.usage}\`)`;
	}

	public run(
		message: Message,
		[result]: any[] | RandomImageResult[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel);
		if (result === 'types') {
			embed
			.setAuthor('Image Types', message.author.displayAvatarURL())
			.setDescription(this.types.join(', '));
		} else {
			embed.setImage(result.url);
		}

		return message.reply(embed);
	}
}

export { WeebCommand as Command };
