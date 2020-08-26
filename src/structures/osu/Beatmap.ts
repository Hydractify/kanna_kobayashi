import { Moment, utc } from 'moment';

import { BeatmapGenre } from '../../types/osu/BeatmapGenre';
import { BeatmapLanguage } from '../../types/osu/BeatmapLanguage';
import { BeatmapState } from '../../types/osu/BeatmapState';
import { OsuMode } from '../../types/osu/OsuMode';
import { titleCase } from '../../util/Util';
import { Api } from './';
import { Score } from './Score';

/**
 * Represents an osu! beatmap.
 */
export class Beatmap
{
	/**
	 * Fetch an osu! beatmap by id, mode defaults to `OsuMode.OSU`.
	 */
	public static async fetch(id: string | number, mode: OsuMode = OsuMode.OSU): Promise<Beatmap | undefined>
	{
		const [data]: { [key: string]: string }[] = await Api().get_beatmaps.get({
			query: {
				a: 1,
				b: id,
				limit: 1,
				m: mode,
			},
		});

		if (!data) return undefined;

		return new this(data);
	}

	/**
	 * Fetch a full set of osu! beatmaps.
	 */
	public static async fetchSet(id: string | number): Promise<Beatmap[] | undefined>
	{
		const data: { [key: string]: string }[] = await Api().get_beatmaps.get({
			query: { s: id },
		});

		if (!data || !data.length) return undefined;

		return data.map((map: { [key: string]: string }) => new this(map));
	}

	/**
	 * `AR` of the beatmap
	 */
	public readonly approachRate: number;
	/**
	 * The current approval state of the beatmap
	 */
	public readonly approved: BeatmapState;
	/**
	 * When the map was approved
	 */
	public readonly approvedAt: Moment | undefined;
	/**
	 * Artist of the song used in the beatmap
	 */
	public readonly artist: string;
	/**
	 * Bpm of the beatmap
	 */
	public readonly bpm: string;
	/**
	 * `CS` of the beatmap
	 */
	public readonly circleSize: number;
	/**
	 * Name of the user that mapped this beatmap
	 */
	public readonly creator: string;
	/**
	 * `Star` rating of the beatmap
	 */
	public readonly difficultyRating: number;
	/**
	 * Number of favorites
	 */
	public readonly favoriteCount: number;
	/**
	 * Genre of the song of the beatmap
	 */
	public readonly genre: BeatmapGenre;
	/**
	 * `HP` of the beatmap
	 */
	public readonly healthDrain: number;
	/**
	 * Id of the beatmap
	 */
	public readonly id: string;
	/**
	 * Language of the beatmap
	 */
	public readonly language: BeatmapLanguage;
	/**
	 * Total length, including pauses, of the beatmap
	 */
	public readonly length: number;
	/**
	 * Maximum reachable combo, `undefined` for taiko for some reason
	 */
	public readonly maxCombo: number | undefined;
	/**
	 * Mode the beatmap is in
	 */
	public readonly mode: OsuMode;
	/**
	 * `OD` of the beatmap
	 */
	public readonly overallDifficulty: number;
	/**
	 * Number of passed plays
	 */
	public readonly passCount: number;
	/**
	 * Number of total plays, including fails
	 */
	public readonly playCount: number;
	/**
	 * Total length, excluding pauses, of the beatmap
	 */
	public readonly playLength: number;
	/**
	 * Id of the set this beatmap is part of
	 */
	public readonly setId: string;
	/**
	 * Tags of the beatmap
	 */
	public readonly tags: string;
	/**
	 * Title of the song used in the beatmap
	 */
	public readonly title: string;
	/**
	 * Whenever this beatmap was updated last
	 */
	public readonly updatedAt: Moment;
	/**
	 * Name of the `difficulty`
	 */
	public readonly version: string;

	/**
	 * Instantiate a new beatmap
	 */
	public constructor(data: { [key: string]: string })
	{
		this.approved = Number(data.approved);
		this.approvedAt = data.approved_date ? utc(`${data.approved_date}+08:00`) : undefined;
		this.updatedAt = utc(`${data.last_update}+80:00`);
		this.artist = data.artist;
		this.id = data.beatmap_id;
		this.setId = data.beatmapset_id;
		this.bpm = data.bpm;
		this.creator = data.creator;

		this.difficultyRating = Number(data.difficultyrating);
		this.circleSize = Number(data.diff_size);
		this.overallDifficulty = Number(data.diff_overall);
		this.approachRate = Number(data.diff_approach);
		this.healthDrain = Number(data.diff_drain);

		this.genre = Number(data.genre_id);
		this.language = Number(data.language_id);

		this.playLength = Number(data.hit_length);
		this.length = Number(data.total_length);

		this.title = data.title;
		this.version = data.version;
		// Technically a thing: this.fileMD5 = data.file_md5;
		this.mode = Number(data.mode);
		this.tags = data.tags.replace(/ +/g, ', ');
		this.favoriteCount = Number(data.favourite_count);
		this.playCount = Number(data.playcount);
		this.passCount = Number(data.passcount);
		// Taiko has no max combo for some reason
		this.maxCombo = data.max_combo ? Number(data.max_combo) : undefined;
	}

	/**
	 * Human readable representation of the language of the song of the beatmap
	 */
	public get languageString(): string
	{
		return titleCase(BeatmapLanguage[this.language] ?? `Unknown Language: ${this.language}`);
	}

	/**
	 * Human readable representation of the genre of the song of the beatmap
	 */
	public get genreString(): string
	{
		return titleCase(BeatmapGenre[this.genre] ?? `Unknown Genre: ${this.genre}`);
	}

	/**
	 * Human readable representation of the state of the beatmap
	 */
	public get stateString(): string
	{
		return titleCase(BeatmapState[this.approved] ?? `Unknown State: ${this.approved}`);
	}

	/**
	 * Url pointing to the thumbnail of the beatmap
	 */
	public get iconURL(): string
	{
		return `https://b.ppy.sh/thumb/${this.setId}l.jpg`;
	}

	/**
	 * Url pointing to the website of the set
	 */
	public get setURL(): string
	{
		return `https://osu.ppy.sh/s/${this.setId}`;
	}

	/**
	 * Fetch the best scores of the beatmap.
	 */
	public async fetchBestScores(
		{ limit = 10, mode = this.mode }: { limit?: number; mode?: OsuMode } = {},
	): Promise<Required<Score>[]>
	{
		const scores: { [key: string]: string }[] = await Api().get_scores.get({
			query: {
				b: this.id,
				limit,
				m: mode,
			},
		});

		const promises: Promise<Required<Score>>[] = [];
		for (const data of scores)
		{
			const score: Required<Score> = new Score(data, { beatmap: this, mode }) as Required<Score>;
			promises.push(score.fetchUser().then(() => score));
		}

		return Promise.all(promises);
	}

	/**
	 * Url pointing to the website of the version
	 */
	public versionURL(mode: OsuMode = this.mode): string
	{
		return `https://osu.ppy.sh/b/${this.id}&m${mode}`;
	}
}
