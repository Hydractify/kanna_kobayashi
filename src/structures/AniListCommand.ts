import { Collection, Message } from 'discord.js';

import { User as UserModel } from '../models/User';
import { AnimeData } from '../types/anilist/AnimeData';
import { AniType } from '../types/anilist/AniType';
import { CharData } from '../types/anilist/CharData';
import { MangaData } from '../types/anilist/MangaData';
import { ICommandInfo } from '../types/ICommandInfo';
import { chunkArray, replaceMap, titleCase } from '../util/Util';
import { APIRouter, buildRouter } from './Api';
import { Command } from './Command';
import { CommandHandler } from './CommandHandler';
import { MessageEmbed } from './MessageEmbed';

// tslint:disable-next-line:variable-name
const Api: () => APIRouter = buildRouter({
	baseURL: `https://anilist.co/api`,
});
const { anilist } = require('../../data');
Object.assign(anilist, { grant_type: 'client_credentials' });

type AllTypes = AnimeData | CharData | MangaData;

/**
 * Abstract command to provide Anilist functionality for commands in an easy manner.
 */
export abstract class AniListCommand extends Command {

	/**
	 * Object literal filled with chars to replace html entities with their actual representations
	 */
	protected static replaceChars: { [key: string]: string } = {
		'&#039;': '\'',
		'&amp;': '&',
		'&gt;': '>',
		'&lt;': '<',
		'&quot;': '"',
		'<br />': '\n',
		'<br>': '\n',
		'`': '\'',
	};

	/**
	 * Type of resources the command is intended for.
	 */
	protected readonly type: AniType;

	/**
	 * Derives from the AniListCommand class.
	 */
	protected constructor(handler: CommandHandler, options: ICommandInfo & { type: AniType }) {
		super(handler, options);

		if (!options.type) {
			throw new Error(`${this.name} (deriving from AniListCommand is missing a type!`);
		}

		this.type = options.type;
	}

	/**
	 * Whether the passed entry is an anime
	 * Purely to satisfy TS.
	 */
	public isAnime(entry: AllTypes): entry is AnimeData {
		return entry.series_type === 'anime';
	}

	/**
	 * Whether the passed entry is a char
	 * Purely to satisfy TS.
	 */
	public isChar(entry: AllTypes): entry is CharData {
		return !Boolean(entry.series_type);
	}

	/**
	 * Build an embed for the passed type of data.
	 */
	protected buildEmbed(message: Message, authorModel: UserModel, entry: AllTypes): MessageEmbed {
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setThumbnail(entry.image_url_lge);

		// Whether this entry is a character entry
		if (this.isChar(entry)) {
			embed.setTitle(`${entry.name_first || '\u200b'} ${entry.name_last || '\u200b'}`)
				.setDescription(entry.name_japanese || '');

			if (entry.name_alt) embed.addField('Aliases:', entry.name_alt, true);

			return embed.splitToFields('Description', entry.info
				? replaceMap(entry.info, AniListCommand.replaceChars)
				: 'Not specified',
			);
		}

		const desc: string[] = [entry.title_romaji];

		if (entry.title_english !== entry.title_romaji) {
			desc.push('', entry.title_english);
		}

		// 3 genres per row
		const genres: string = chunkArray(entry.genres, 3).map((chunk: string[]) => chunk.join(', ')).join('\n');

		embed
			.setTitle(entry.title_japanese)
			.setURL(`https://anilist.co/${this.type}/${entry.id}`)
			.setDescription(desc)
			.addField('Genres', genres || 'Not specified', true)
			.addField('Rating | Type', `${entry.average_score} | ${entry.type}`, true);

		if (this.isAnime(entry)) {
			embed.addField(
				'Episodes',
				entry.total_episodes,
				true,
			);
		} else {
			embed.addField(
				'Chaprter | Volumes',
				`${entry.total_chapters} | ${entry.total_volumes}`,
				true,
			);
		}

		if (entry.start_date_fuzzy) {
			let title: string = 'Start';
			let value: string = this.formatFuzzy(entry.start_date_fuzzy);

			if (this.isAnime(entry)
				? entry.airing_status === 'finished airing'
				: entry.publishing_status === 'finished publishing') {
				title = 'Period';
				value += ` - ${this.formatFuzzy(entry.end_date_fuzzy) || 'Not specified'}`;
			}

			embed.addField(title, value, true);
		}

		embed
			.splitToFields(
			'Description',
			entry.description
				? replaceMap(entry.description, AniListCommand.replaceChars)
				: 'Not specified',
		)
			.addField(
			`${this.isAnime(entry) ? 'Airing' : 'Publishing'} status`,
			titleCase(this.isAnime(entry) ? entry.airing_status : entry.publishing_status),
			true,
		);

		if (this.isAnime(entry) && entry.source) {
			embed.addField('Origin', entry.source, true);
		}

		return embed;
	}

	/**
	 * Formats the fuzzy dates provided from anilist. (Using timestamps is way overrated.)
	 */
	protected formatFuzzy(input: string | number): string {
		if (!input) return '';
		if (typeof input !== 'string') input = String(input);

		return `${input.substring(6, 8)}.${input.substring(4, 6)}.${input.substring(0, 4)}`;
	}

	/**
	 * Prompts the user to pick one of the search results.
	 */
	protected async pick<T extends AllTypes>(message: Message, authorModel: UserModel, entries: T[]): Promise<T> {
		const mapped: string[] = [];
		const { length }: string = String(entries.length);
		const type: string = entries[0].series_type || 'char';
		let count: number = 0;

		if (type === 'char') {
			for (const entry of entries as CharData[]) {
				mapped.push(`\`${String(++count).padEnd(length)}\` - ${entry.name_first} ${entry.name_last || ''}`);
			}
		} else {
			for (const entry of entries as (AnimeData | MangaData)[]) {
				mapped.push(`\`${String(++count).padEnd(length)}\` - ${entry.title_english}`);
			}
		}
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setTitle(`I found more than one ${type}`)
			.setDescription(mapped.join('\n').slice(0, 2000))
			.addField('Notice', [
				`For which ${type} would you like to see additional information?`,
				'Please respond with the number of the entry you would like to see, for example: `3`.',
				'',
				'To cancel this prompt respond with `cancel`, this prompt times out after `30` seconds.',
			]);

		const prompt: Message = await message.channel.send(embed) as Message;
		const response: Message = await message.channel.awaitMessages(
			(msg: Message) => msg.author.id === message.author.id,
			{ max: 1, time: 3e4 },
		).then((collected: Collection<string, Message>) => collected.first());

		// We don't care about rejections here, those are most likely 404 anyway
		prompt.delete().catch(() => undefined);
		// Only try to delete if one is present and we have manage messages in the current channel
		if (response && response.deletable) response.delete().catch(() => undefined);

		if (!response || response.content.toLowerCase() === 'cancel') {
			return undefined;
		}

		return entries[Number(response.content.split(' ')[0]) - 1];
	}

	/**
	 * Retrieve the currently valid token for anilist, requests a new token if necessary
	 */
	protected async retrieveToken(): Promise<string> {
		let token: string = await this.redis.get(`anilist:token`);

		if (!token) {
			const data: {
				access_token: string;
				expires_in: number;
			} = await Api().auth.access_token.post({ data: anilist });

			this.redis.set('anilist:token', data.access_token, 'EX', data.expires_in);

			token = data.access_token;
		}

		return token;
	}

	/**
	 * Search for the specified type on anilist, returns an array of results or `undefined` when nothing was found.
	 */
	protected async search<T extends AllTypes>(search: string): Promise<T[]> {
		const token: string = await this.retrieveToken();
		search = encodeURIComponent(search);

		const response: any = await Api()(this.type).search(search).get({ query: { access_token: token } });

		if (response.error) {
			if (response.error.messages[0] === 'No Results.') return undefined;

			throw new Error(response.error.messages.join('\n'));
		}

		return response;
	}
}
