const { get, post } = require('snekfetch');

const { anilist } = require('../data');
const { chunkArray, replaceMap, titleCase } = require('../util/util');
const Command = require('./Command');
const { instance: { db: redis } } = require('./Redis');
const RichEmbed = require('./RichEmbed');

// eslint-disable-next-line camelcase
Object.assign(anilist, { grant_type: 'client_credentials' });

class AniListCommand extends Command {
	constructor(handler, options) {
		super(handler, options);

		if (!options.type) {
			throw new Error(`${this.name} (child of AniListCommand) is missing a type!`);
		}

		/**
		 * Type of entries this command will look for
		 * @type {string}
		 */
		this.type = options.type;
	}
	/**
	 * Searches for the requested type, specified by the passed query.
	 * @param {string} query What to search for
	 * @returns {?Array<Object>} Array of search results
	 * @protected
	 */
	async search(query) {
		const token = await this._retrieveToken();
		query = encodeURIComponent(query);

		const url = `https://anilist.co/api/${this.type}/search/${query}?access_token=${token}`;
		const { body } = await get(url);

		if (body.error) {
			if (body.error.messages[0] === 'No Results.') {
				return null;
			}

			throw new Error(body.error.messages.join('\n'));
		}

		return body;
	}

	/**
	 * Prompts the user to pick one of the search results
	 * @param {Message} message Received message
	 * @param {User} authorModel Sequelize user model instance
	 * @param {Object[]} entries Array of search results
	 * @returns {?Object} Picked entry or null
	 * @protected
	 */
	async pick(message, authorModel, entries) {
		const type = entries[0].series_type || 'char';
		const mapped = [];
		let count = 0;

		const { length } = String(entries.length);
		if (type !== 'char') {
			for (const entry of entries) {
				mapped.push(`\`${String(++count).padEnd(length)}\` - ${entry.title_english}`);
			}
		} else {
			for (const char of entries) {
				mapped.push(`\`${String(++count).padEnd(length)}\` - ${char.name_first} ${char.name_list || ''}`);
			}
		}

		const embed = RichEmbed.common(message, authorModel)
			.setTitle(`I found more than one ${type}`)
			.setDescription(mapped.join('\n').slice(0, 2000))
			.addField('Notice', [
				`For which ${type} would you like to see addition information?`,
				'Please respond with the number of the entry you wouldlike to see, for example: `3`.',
				'',
				'To cancel this prompt respond with `chancel`, this prompt times out after `30` seconds.'
			]);

		const prompt = await message.channel.send(embed);
		const response = await message.channel.awaitMessages(
			msg => msg.author.id === message.author.id,
			{ maxMatches: 1, time: 3e4 }
		).then(collected => collected.first());

		// We don't care about rejections here, those are most likely 404 anyway
		prompt.delete().catch(() => null);
		// Only try to delete if one is present and we have manage messages in the current channel
		if (response && response.deletable) response.delete().catch(() => null);

		if (!response || response.content.toLowerCase() === 'cancel') {
			return null;
		}

		return entries[Number(response.content.split(' ')[0]) - 1] || null;
	}

	/**
	 * Builds an embed for this type of data
	 * @param {Message} message Received message
	 * @param {User} authorModel Sequelize user model instance
	 * @param {Object} entry Entry data
	 * @returns {RichEmbed}
	 * @protected
	 */
	buildEmbed(message, authorModel, entry) {
		const embed = RichEmbed.common(message, authorModel)
			.setThumbnail(entry.image_url_lge);

		// Whether this entry is a character entry
		if (!entry.series_type) {
			embed.setTitle(`${entry.name_first || '\u200b'} ${entry.name_last || '\u200b'}`)
				.setDescription(entry.name_japanese || '');

			if (entry.name_alt) embed.addField('Aliases:', entry.name_alt, true);

			return embed.splitToFields('Description', entry.info
				? replaceMap(entry.info, AniListCommand.replaceChars)
				: 'Not specified'
			);
		}

		const desc = [entry.title_romaji];

		if (entry.title_english !== entry.title_romaji) {
			desc.push('', entry.title_english);
		}

		// 3 genres per row
		const genres = chunkArray(entry.genres, 3).map(chunk => chunk.join(', ')).join('\n');
		const isAnime = entry.series_type === 'anime';

		embed
			.setTitle(entry.title_japanese)
			.setURL(`https://anilist.co/${this.type}/${entry.id}`)
			.setDescription(desc)
			.addField('Genres', genres || 'Not specified', true)
			.addField('Rating | Type', `${entry.average_score} | ${entry.type}`, true)
			.addField(
				isAnime
					? 'Episodes'
					: 'Chapter | Volumes',
				isAnime
					? entry.total_episodes
					: `${entry.total_chapters} | ${entry.total_volumes}`,
				true
			);

		if (entry.start_date_fuzzy) {
			let title = 'Start';
			let value = this._formatFuzzy(entry.start_date_fuzzy);

			if (entry.airing_status === 'finished airing'
				|| entry.publishing_status === 'finished publishing') {
				title = 'Period';
				value += ` - ${this._formatFuzzy(entry.end_date_fuzzy) || 'Not specified'}`;
			}

			embed.addField(title, value, true);
		}

		embed
			.splitToFields(
				'Description',
				entry.description
					? replaceMap(entry.description, AniListCommand.replaceChars)
					: 'Not specified'
			).addField(
				`${isAnime ? 'Airing' : 'Publishing'} status`,
				titleCase(entry[isAnime ? 'airing_status' : 'publishing_status']),
				true
			);

		if (entry.source) {
			embed.addField('Origin', entry.source, true);
		}

		return embed;
	}

	/**
	 * Formats the fuzzy dates provided from anilist. (Using timestamps is way overrated.)
	 * @param {number|string} input - The provided number, can be a string
	 * @returns {string} The formatted output
	 * @private
	 */
	_formatFuzzy(input) {
		if (!input) return '';
		if (typeof input !== 'string') input = String(input);

		return `${input.substring(6, 8)}.${input.substring(4, 6)}.${input.substring(0, 4)}`;
	}

	/**
	 * Retrieves or refreshes the access token required to use the anilist api.
	 * @returns {Promise<string>} Token
	 * @private
	 */
	async _retrieveToken() {
		let token = await redis.getAsync('anilist:token');

		if (!token) {
			const {
				body: {
					access_token: accessToken,
					expires_in: expiresIn
				}
			} = await post('https://anilist.co/api/auth/access_token').send(anilist);

			await redis.setAsync('anilist:token', accessToken);
			await redis.expireAsync('anilist:token', expiresIn);

			token = accessToken;
		}

		return token;
	}
}

/**
 * Object literal filled with chars to replace html entities with their actual representations
 * @name AniListCommand.replaceChars
 * @type {Object}
 * @static
 * @protected
 */
AniListCommand.replaceChars = {
	'&#039;': '\'',
	'&amp;': '&',
	'&gt;': '>',
	'&lt;': '<',
	'&quot;': '"',
	'<br />': '\n',
	'<br>': '\n',
	'`': '\''
};

module.exports = AniListCommand;
