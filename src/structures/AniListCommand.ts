import { Collection, Message } from 'discord.js';
import { readFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { User as UserModel } from '../models/User';
import { ICharacter } from '../types/anilist/ICharacter';
import { ICharacterName } from '../types/anilist/ICharacterName';
import { IFuzzyDate } from '../types/anilist/IFuzzyDate';
import { IMedia } from '../types/anilist/IMedia';
import { MediaStatus } from '../types/anilist/MediaStatus';
import { MediaType } from '../types/anilist/MediaType';
import { ICommandInfo } from '../types/ICommandInfo';
import { chunkArray, replaceMap, titleCase } from '../util/Util';
import { APIRouter, buildRouter } from './Api';
import { Command } from './Command';
import { CommandHandler } from './CommandHandler';
import { MessageEmbed } from './MessageEmbed';

const readFileAsync = promisify(readFile);

// tslint:disable-next-line:variable-name
const Api: () => APIRouter = buildRouter({
	baseURL: 'https://graphql.anilist.co',
});

/**
 * Abstract command to provide Anilist functionality for commands in an easy manner.
 */
export abstract class AniListCommand<T extends (ICharacter | IMedia)> extends Command {

	/**
	 * Object literal filled with chars to replace html entities with their actual representations
	 */
	protected static replaceChars: { [key: string]: string } = {
		'&#039;': '\'',
		'&amp;': '&',
		'&gt;': '>',
		'&lt;': '<',
		'&mdash;': '—',
		'&quot;': '"',
		'<br />': '\n',
		'<br>': '\n',
		'`': '\'',
	};

	/**
	 * Type of resources the command is intended for.
	 */
	protected readonly type: MediaType;

	/**
	 * Query of this command
	 */
	protected query: string;

	/**
	 * Derives from the AniListCommand class.
	 */
	protected constructor(handler: CommandHandler, options: ICommandInfo & { type: MediaType }) {
		super(handler, options);

		if (!options.type) {
			throw new Error(`${this.name} (deriving from AniListCommand is missing a type!`);
		}

		this.type = options.type;

		if (this.type === MediaType.CHARACTER) {
			readFileAsync(join(__dirname, '..', '..', 'static', 'anilist', 'character.graphql'), { encoding: 'utf-8' })
				.then((query: string) => {
					this.query = query;
				});
		} else {
			readFileAsync(join(__dirname, '..', '..', 'static', 'anilist', 'media.graphql'), { encoding: 'utf-8' })
				.then((query: string) => {
					this.query = query;
				});
		}
	}

	public async free(): Promise<void> {
		delete require.cache[require.resolve(__filename)];

		super.free();
	}

	/**
	 * Whether the passed entry is a char
	 * Purely to satisfy TS.
	 */
	public isChar(entry: ICharacter | IMedia): entry is ICharacter {
		return this.type === MediaType.CHARACTER;
	}

	/**
	 * Build an embed for the passed type of data.
	 */
	protected buildEmbed(message: Message, authorModel: UserModel, entry: ICharacter | IMedia): MessageEmbed {
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setThumbnail(entry.image.large)
			.setURL(entry.siteUrl);

		// Whether this entry is a character entry
		if (this.isChar(entry)) {
			embed.setTitle(`${entry.name.first || '\u200b'} ${entry.name.last || '\u200b'}`)
				.setDescription(entry.name.native || '');

			const { alternative }: ICharacterName = entry.name;
			if (alternative && alternative[0]) embed.addField('Aliases:', alternative.join(', '), true);

			return embed.splitToFields('Description', entry.description
				? replaceMap(entry.description, AniListCommand.replaceChars)
					// I don't ask why there are tons of spaces sometimes
					.replace(/ +?~!.*?!~/g, ' `<Spoiler>`')
				: 'Not specified',
			);
		}

		const description: string[] = [...new Set(Object.values(entry.title)
			.filter((value: string) => value && value.trim())
			.map((value: string) => value.trim()),
		)];

		// 3 genres per row
		const genres: string = chunkArray(entry.genres, 3).map((chunk: string[]) => chunk.join(', ')).join('\n');

		embed
			.setTitle(description.shift())
			.setDescription(description)
			.addField('Genres', genres || 'Not specified', true)
			.addField(
				'Rating | Type',
				`${entry.averageScore || entry.meanScore || 'n/a'} | ${titleCase(this.type.toLowerCase())}`,
				true,
			);

		if (this.type === MediaType.ANIME) {
			embed.addField(
				'Episodes',
				entry.episodes || 'n/a',
				true,
			);
		} else {
			embed.addField(
				'Chapters | Volumes',
				`${entry.chapters || 'n/a'} | ${entry.volumes || 'n/a'}`,
				true,
			);
		}

		if (entry.startDate) {
			let title: string = 'Start';
			let value: string = this.formatFuzzy(entry.startDate);

			if (entry.status === MediaStatus.FINISHED) {
				title = 'Period';
				value += ` - ${this.formatFuzzy(entry.endDate)}`;
			}

			embed.addField(title, value, true);
		}

		embed
			.splitToFields(
				'Description',
				entry.description && entry.description.trim()
					? replaceMap(entry.description, AniListCommand.replaceChars)
					: 'Not specified',
			)
			.addField(
				`${this.type === MediaType.ANIME ? 'Airing' : 'Publishing'} Status`,
				entry.status ? titleCase(entry.status.replace(/_/g, ' ').toLowerCase()) : 'n/a',
				true,
			);

		if (this.type === MediaType.ANIME && entry.source) {
			embed.addField('Origin', titleCase(entry.source.replace(/_/g, ' ').toLowerCase()), true);
		}

		return embed;
	}

	/**
	 * Formats the fuzzy dates provided from anilist. (Using timestamps is way overrated.)
	 */
	protected formatFuzzy(input: IFuzzyDate): string {
		if (!input) return '';

		return `${input.day || '??'}.${input.month || '??'}.${input.year || '????'}`;
	}

	/**
	 * Prompts the user to pick one of the search results.
	 */
	protected async pick(
		message: Message,
		authorModel: UserModel,
		entries: T[],
	): Promise<T> {
		const mapped: string[] = [];
		const { length }: string = String(entries.length);
		let count: number = 0;

		if (this.type === MediaType.CHARACTER) {
			for (const entry of entries as ICharacter[]) {
				mapped.push(`\`${String(++count).padEnd(length)}\` - ${entry.name.first} ${entry.name.last || ''}`);
			}
		} else {
			for (const entry of entries as IMedia[]) {
				mapped.push(`\`${String(++count).padEnd(length)}\` - ${entry.title.english || entry.title.romaji}`);
			}
		}
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setTitle(`I found more than one ${titleCase(this.type.toLowerCase())}`)
			.setDescription(mapped.join('\n').slice(0, 2000))
			.addField('Notice', [
				`For which ${titleCase(this.type.toLowerCase())} would you like to see additional information?`,
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
	 * Search for the specified type on anilist, returns an array of results or `undefined` when nothing was found.
	 */
	protected async search(query: string): Promise<T[]> {
		const response: {
			data?: {
				result: {
					results: T[];
				};
			};
			errors?: {
				message: string;
				status: number;
				locations: {
					line: number;
					column: number;
				}[]
				validation?: {
					[name: string]: string[];
				}
			}[];
		} = await Api().post({
			data: {
				query: this.query,
				variables: { query, type: this.type },
			},
		});

		if (response.errors) {
			const error: Error = new Error();
			Object.assign(error, response.errors.shift());
			if (response.errors.length) {
				(error as any).extra = response.errors;
			}

			throw error;
		}

		if (!response.data.result.results.length) {
			// Nothing found
			return undefined;
		}

		return response.data.result.results;
	}

}
