import { OsuMode } from '../../types/osu/OsuMode';
import { Api } from './';
import { Score } from './Score';

/**
 * Represents an osu! user.
 */
export class User {
	/**
	 * Fetches a full osu! user, scores by passed mode.
	 * Mode defaults to `OsuMode.OSU`.
	 */
	public static async fetch(query: string | number, mode: OsuMode = OsuMode.OSU): Promise<User | undefined> {
		const [data]: { [key: string]: string }[] = await Api().get_user.get({
			query: {
				limit: 1,
				m: mode,
				u: query,
			},
		});

		if (!data) return undefined;

		return new this(data) as User;
	}

	/**
	 * Object of char unicodes to build flags easier.
	 */
	// tslint:disable-next-line:variable-name
	private static readonly FlagChars: { [key: string]: string } = {
		A: '🇦',
		B: '🇧',
		C: '🇨',
		D: '🇩',
		E: '🇪',
		F: '🇫',
		G: '🇬',
		H: '🇭',
		I: '🇮',
		J: '🇯',
		K: '🇰',
		L: '🇱',
		M: '🇲',
		N: '🇳',
		O: '🇴',
		P: '🇵',
		Q: '🇶',
		R: '🇷',
		S: '🇸',
		T: '🇹',
		U: '🇺',
		V: '🇻',
		W: '🇼',
		X: '🇽',
		Y: '🇾',
		Z: '🇿',
	};

	/**
	 * Total accuracy the user has
	 */
	public readonly accuracy?: number;
	/**
	 * Total number of 100s the user has
	 */
	public readonly count100?: number;
	/**
	 * Total number of 300s the user has
	 */
	public readonly count300?: number;
	/**
	 * Total number of 50s the user has
	 */
	public readonly count50?: number;
	/**
	 * Total amount of As the user has achieved
	 */
	public readonly countA?: number;
	/**
	 * Country the user is from
	 */
	public readonly country: string;
	/**
	 * Rank the user has in their country
	 */
	public readonly countryRank?: number;
	/**
	 * Total amount of Ss the user has achieved
	 */
	public readonly countS?: number;
	/**
	 * Total amount of SSs the user has achieved
	 */
	public readonly countSS?: number;
	/**
	 * Id of the user
	 */
	public readonly id: string;
	/**
	 * Level of the user
	 */
	public readonly level?: number;
	/**
	 * Total amount of plays the user has
	 */
	public readonly playCount?: number;
	/**
	 * Total amount of pp the user has
	 */
	public readonly pp?: number;
	/**
	 * Current rank of the user
	 */
	public readonly rank?: number;
	/**
	 * Total ranked score, calculated by adding the best scores of all sets together
	 */
	public readonly rankedScore?: number;
	/**
	 * Total score the user achieved in all ranked beatmaps in all plays
	 */
	public readonly totalScore?: number;
	/**
	 * Username of the user
	 */
	public readonly username: string;

	/**
	 * Instantiate a new osu! user.
	 */
	public constructor(data: { [key: string]: string }, full: boolean = true) {
		this.id = data.user_id;
		this.username = data.username;
		this.country = data.country;

		if (full) {
			this.count300 = Number(data.count300);
			this.count100 = Number(data.count100);
			this.count50 = Number(data.count50);
			this.playCount = Number(data.playcount);
			this.rankedScore = Number(data.ranked_score);
			this.totalScore = Number(data.total_score);
			this.rank = Number(data.pp_rank);
			this.level = Number(data.level);
			this.pp = Number(data.pp_raw);
			this.accuracy = Number(data.accuracy);
			this.countSS = Number(data.count_rank_ss);
			this.countS = Number(data.count_rank_s);
			this.countA = Number(data.count_rank_a);
			this.countryRank = Number(data.pp_country_rank);
			// Technically a thing: this.events = data.events;
		}
	}

	/**
	 * Unicode flag of the country the user is from
	 */
	public get countryFlag(): string {
		return this.country.split('').map((char: string) => User.FlagChars[char]).join('');
	}

	/**
	 * Url pointing to the user (avatar) of the user
	 */
	public get iconURL(): string {
		return `https://a.ppy.sh/${this.id}`;
	}

	/**
	 * Url pointing to the profile of the user
	 */
	public get profileURL(): string {
		return `https://osu.ppy.sh/u/${this.id}`;
	}

	/**
	 * Fetch the best plays of the user
	 */
	public fetchBest(options: { limit?: number; mode?: OsuMode }): Promise<Score[]> {
		return this.fetch('best', options);
	}

	/**
	 * Fetch the recent plays of the user
	 */
	public fetchRecent(options: { limit?: number; mode?: OsuMode }): Promise<Score[]> {
		return this.fetch('recent', options);
	}

	/**
	 * Helper method to avoid code duplications when fetching scores
	 */
	private async fetch(type: string, { limit = 10, mode = OsuMode.OSU }: { limit?: number; mode?: OsuMode })
		: Promise<Score[]> {
		const scores: { [key: string]: string }[] = await Api()[`get_user_${type}`].get({
			query: {
				limit,
				m: mode,
				type: 'id',
				u: this.id,
			},
		});

		const promises: Promise<Score>[] = [];
		for (const data of scores) {
			const score: Score = new Score(data, { user: this, mode });

			promises.push(score.fetchBeatmap(mode).then(() => score));
		}

		return Promise.all(promises);
	}
}
