const { Attachment } = require('discord.js');
const { parse } = require('url');
const { extname } = require('path');

const { sauceNaoToken } = require('../../data');
const Api = require('../../structures/Api').register('saucenao', {
	baseURL: 'https://saucenao.com/search.php',
	queryParams: {
		/* eslint-disable camelcase */
		api_key: sauceNaoToken,
		// JSON
		output_type: 2,
		/* eslint-enable camelcase */
		// All dbs
		db: 999,
		// Max results
		numres: 1
	}
});
const Command = require('../../structures/Command');
const { instance: { db: redis } } = require('../../structures/Redis');
const RichEmbed = require('../../structures/RichEmbed');

class SauceNaoCommand extends Command {
	constructor(handler) {
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
				'saucenao https://example.com/image.png'
			],
			// TODO: Replace with Patreon tier once implemented.
			permLevel: 4
		});
	}

	async run(message, [url], { authorModel }) {
		// Uploaded attachment or embed (if fast enough)
		let resolved = this._resolveUrl(message);
		// Passed message id
		if (!resolved && /^\d{17,19}$/.test(url)) {
			resolved = this._resolveUrl(
				await message.channel.fetchMessage(url).catch(() => null)
			);
		}

		// Or just a hyperlink in the command message
		const source = await this._request(resolved || url);

		if (!source) return message.reply('I could not find any source for the provided image.');

		if (typeof source === 'string') return message.reply(source);

		const author = source.artist
			? `${source.artist}${source.title ? ` -- ${source.title}` : ''}`
			: source.title || 'No data author/title available';

		let [extName] = extname(parse(source.thumbnail).path).split('?');
		const embed = RichEmbed.common(message, authorModel)
			.setAuthor(author, null, source.url)
			.setDescription([
				`**Similarity:** ${source.similarity.toFixed(2)}%`,
				`[Source](${source.url})`
			])
			.setImage(`attachment://source${extName || '.png'}`);

		const files = [new Attachment(source.thumbnail, `source${extName || '.png'}`)];

		return message.channel.send({ embed, files });
	}

	_resolveUrl(message) {
		if (!message) return null;

		let image = message.attachments.first();
		if (image && image.height) return image.url;

		const embed = message.embeds[0];
		if (embed && (embed.thumbnail || embed.image)) {
			image = embed.thumbnail || embed.image;
			if (image.height) return image.url;
		}

		return null;
	}

	async _request(url) {
		const [short, long] = await redis.mgetAsync('saucenao:shortRemaining', 'saucenao:longRemaining');

		if (short !== null && Number(short) <= 0) {
			return 'I reached the shorter limit for source lookups, try it again in ~30 seconds.';
		}

		if (long !== null && (Number(long) <= 0)) {
			return 'I reached the limit for source lookups, try it again in approximately one hour.';
		}

		const response = await Api.query({ url }).get();

		if (response instanceof Buffer) {
			// Responding with JSON is overrated, just send html instead
			const responseArray = response.toString().split('\n');
			const responseString = responseArray[responseArray.length - 1];
			return responseString[0].toLowerCase() + responseString.slice(1);
		}

		const {
			header: {
				short_remaining: shortRemaining,
				long_remaining: longRemaining,
				results_returned: resultCount
			},
			results: [result]
		} = response;

		redis.multi()
			.mset('saucenao:shortRemaining', shortRemaining, 'saucenao:longRemaining', longRemaining)
			.expire('saucenao:shortRemaining', 30)
			// Set TTL to one hour.
			// The rate limit is per 24 hours, but the api does not tell us when those are over.
			.expire('saucenao:longRemaining', 60 * 60)
			.execAsync()
			.catch(() => null);

		if (resultCount <= 0) {
			return null;
		}

		return {
			similarity: Number(result.header.similarity),
			thumbnail: result.header.thumbnail,
			// There are probably a bunch more of those, hip hip consistency
			artist: result.data.member_name || result.data.author_name || result.data.creator || '',
			url: result.data.ext_urls[0],
			title: result.data.title || ''
		};
	}
}

module.exports = SauceNaoCommand;
