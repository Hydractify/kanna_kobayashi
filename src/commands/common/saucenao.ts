import { Message, MessageAttachment } from 'discord.js';
import { extname } from 'path';
import { RedisClient } from 'redis-p';
import { parse } from 'url';

import { APIRouter, buildRouter } from '../../structures/Api';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';
import { ISauceNaoResult } from '../../types/saucenao/ISauceNaoResult';
import { Redis } from '../../util/RedisDecorator';

const { sauceNaoToken } = require('../../../data');
// tslint:disable-next-line:variable-name
const Api: () => APIRouter = buildRouter({
	baseURL: 'https://saucenao.com/search.php',
	defaultQueryParams: {
		api_key: sauceNaoToken,
		// JSON
		output_type: 2,
		// All dbs
		db: 999,
		// Max results
		numres: 1,
	},
});

@Redis
class SauceNaoCommand extends Command {

	private readonly redis: RedisClient;
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['sauce', 'source'],
			coins: 0,
			exp: 0,
			usage: 'saucenao [URL|MessageID]',
			description: 'Look up the source of an image!',
			name: 'saucenao',
			examples: [
				'saucenao // with an uploaded picture in the same message',
				'saucenao 379246454784524300 // message in the same channel with a picture',
				'saucenao https://example.com/image.png',
			],
			// TODO: Replace with Patreon tier once implemented.
			permLevel: PermLevels.DEV,
		});
	}

	public async run(message: Message, [url]: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		// Uploaded attachment or embed (if fast enough)
		let resolved: string = this._resolveUrl(message);
		// Passed message id
		if (!resolved && /^\d{17,19}$/.test(url)) {
			resolved = this._resolveUrl(
				await message.channel.messages.fetch(url).catch(() => undefined),
			);
		}

		// Or just a hyperlink in the command message
		const source: ISauce | string = await this._request(resolved || url);

		if (!source) return message.reply('I could not find any source for the provided image.');

		if (typeof source === 'string') return message.reply(source);

		const author: string = source.artist
			? `${source.artist}${source.title ? ` -- ${source.title}` : ''}`
			: source.title || 'No data author/title available';

		const [extName]: string[] = extname(parse(source.thumbnail).path).split('?');
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(author, undefined, source.url)
			.setDescription([
				`**Similarity:** ${source.similarity.toFixed(2)}%`,
				`[Source](${source.url})`,
			])
			.setImage(`attachment://source${extName || '.png'}`);

		const files: [MessageAttachment] = [new MessageAttachment(source.thumbnail, `source${extName || '.png'}`)];

		return message.channel.send({ embed, files });
	}

	private async _request(url: string): Promise<ISauce | string> {
		const [short, long]: string[] = await this.redis.mget('saucenao:shortRemaining', 'saucenao:longRemaining');

		if (short !== null && Number(short) <= 0) {
			return 'I reached the shorter limit for source lookups, try it again in ~30 seconds.';
		}

		if (long !== null && (Number(long) <= 0)) {
			return 'I reached the limit for source lookups, try it again in approximately one hour.';
		}

		const response: ISauceNaoResult | Buffer = await Api().get({ query: { url } });

		if (response instanceof Buffer) {
			// Responding with JSON is overrated, just send html instead
			const responseArray: string[] = response.toString().split('\n');
			const responseString: string = responseArray[responseArray.length - 1];

			return responseString[0].toLowerCase() + responseString.slice(1);
		}

		const {
			header: {
				short_remaining: shortRemaining,
				long_remaining: longRemaining,
				results_returned: resultCount,
			},
			results: [{ data, header }],
		} = response;

		this.redis.multi()
			.mset('saucenao:shortRemaining', String(shortRemaining), 'saucenao:longRemaining', String(longRemaining))
			.expire('saucenao:shortRemaining', 30)
			// Set TTL to one hour.
			// The rate limit is per 24 hours, but the api does not tell us when those are over.
			.expire('saucenao:longRemaining', 60 * 60)
			.exec()
			.catch(() => undefined);

		if (resultCount <= 0) {
			return undefined;
		}

		return {
			similarity: Number(header.similarity),
			thumbnail: header.thumbnail,
			// There are probably a bunch more of those, hip hip consistency
			artist: data.member_name
				|| data.author_name
				|| data.creator
				|| data.pawoo_user_display_name,
			url: data.ext_urls[0],
			title: data.title,
		};
	}

	private _resolveUrl(message: Message): string {
		if (!message) return undefined;

		let image: { height?: number; proxyURL?: string; url: string; width?: number } = message.attachments.first();
		if (image && image.height) return image.url;

		// tslint:disable-next-line:no-any
		const embed: MessageEmbed = message.embeds[0] as any;
		if (embed && (embed.thumbnail || embed.image)) {
			image = embed.thumbnail || embed.image;
			if (image.height) return image.url;
		}

		return undefined;
	}
}

export { SauceNaoCommand as Command };

interface ISauce {
	artist: string | undefined;
	similarity: number;
	thumbnail: string;
	title: string | undefined;
	url: string;
}
