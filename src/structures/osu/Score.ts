import { Moment, utc } from 'moment';

import { BeatmapMods } from '../../types/BeatmapMods';
import { OsuMode } from '../../types/OsuMode';
import { Beatmap } from './Beatmap';
import { User } from './User';

/**
 * Represents a score achieved in an osu! beatmap.
 */
export class Score {
	/**
	 * Id of the beatmap the score was achieved in
	 */
	public readonly beatmapId: number;
	/**
	 * Amount of 100s achieved in the score
	 */
	public readonly count100: number;
	/**
	 * Amount of 300s achieved in the score
	 */
	public readonly count300: number;
	/**
	 * Amount of 50s achieved in the score
	 */
	public readonly count50: number;
	/**
	 * Amount of gekis achieved in the score
	 */
	public readonly countGeki: number;
	/**
	 * Amount of katus achieved in the score
	 */
	public readonly countKatu: number;
	/**
	 * Amount of missed notes
	 */
	public readonly countMiss: number;
	/**
	 * Date the score was achieved
	 */
	public readonly date: Moment;
	/**
	 * Highest combo reached in the score
	 */
	public readonly maxCombo: number;
	/**
	 * Mode the score was achieved in
	 */
	public readonly mode: OsuMode;
	/**
	 * Whether the score is perfect (full combo)
	 */
	public readonly perfect: boolean;
	/**
	 * Amount of pp granted, only availabe for best scores
	 */
	public readonly pp: number;
	/**
	 * Global rank achieved with the score
	 */
	public readonly rank: number;
	/**
	 * Score achieved in the score
	 */
	public readonly score: number;
	/**
	 * Id of the user that achieved the score
	 */
	public readonly userId: string;
	/**
	 * Name of the user that achieved the score
	 */
	public readonly username: string;

	/**
	 * Cached beatmap the score was played in
	 */
	private _beatmap: Beatmap;
	/**
	 * Raw bitfied of the score
	 */
	private readonly _enabledMods: number;
	/**
	 * Cached user that achieved the score
	 */
	private _user: User;

	/**
	 * Instantiate a new score
	 */
	public constructor(data: { [key: string]: string }, { beatmap, user, mode }: {
		beatmap?: Beatmap;
		mode?: OsuMode;
		user?: User;
	}) {
		if (typeof mode !== 'number') throw new Error('"mode" must be a number!');
		this.mode = mode;

		this.beatmapId = Number(data.beatmap_id);
		this.score = Number(data.score);
		this.username = data.username;
		this.count300 = Number(data.count300);
		this.count100 = Number(data.count100);
		this.count50 = Number(data.count50);
		this.countMiss = Number(data.countmiss);
		this.maxCombo = Number(data.maxcombo);
		this.countKatu = Number(data.countkatu);
		this.countGeki = Number(data.countgeki);
		this.perfect = data.perfect === '1';
		this._enabledMods = Number(data.enabled_mods);
		this.userId = data.user_id;
		this.date = utc(`${data.date}+08:00`);
		this.rank = Number(data.rank);
		this.pp = data.pp ? Number(data.pp) : undefined;

		this._beatmap = beatmap;
		this._user = user;
	}

	/**
	 * Enabled mods
	 */
	public get enabledMods(): string {
		if (!this._enabledMods) return 'None';
		const enabledMods: Set<string> = new Set<string>();

		// tslint:disable-next-line:no-any
		let mods: [string, number][] = Object.entries(BeatmapMods) as any;
		mods = mods.slice(mods.length / 2);

		for (const [mod, flag] of mods) {
			// tslint:disable-next-line:no-bitwise
			if ((this._enabledMods & flag) === flag) {
				enabledMods.add(mod);
			}
		}

		if (enabledMods.has('NC')) enabledMods.delete('DT');
		if (enabledMods.has('PF')) enabledMods.delete('SD');

		return Array.from(enabledMods.values()).join(', ');
	}

	/**
	 * Accuracy of the score
	 */
	public accuracy(mode: OsuMode = this.mode): number {
		let hits: number;
		let total: number;

		switch (mode) {
			case 0: {
				hits = (this.count50 * 50) + (this.count100 * 100) + (this.count300 * 300);
				total = (this.countMiss + this.count50 + this.count100 + this.count300) * 300;
				break;
			}

			case 1: {
				hits = (this.count100 * 0.5) + this.count300;
				total = this.countMiss + this.count100 + this.count300;
				break;
			}

			case 2: {
				hits = this.count300 + this.count100 + this.count50;
				total = this.countMiss + this.count50 + this.count100 + this.count300 + this.countKatu;
				break;
			}

			case 3: {
				hits = (this.count50 * 50)
					+ (this.count100 * 100)
					+ (this.countKatu * 200)
					+ ((this.countGeki + this.count300) * 300);
				total = (this.countMiss + this.count50 + this.count100 + this.countKatu + this.count300 + this.countGeki) * 300;
				break;
			}

			default: throw new RangeError(`Invalid mode: ${mode}!`);
		}

		return hits / total;
	}

	/**
	 * Fetch the beatmap the score was played in.
	 */
	public async fetchBeatmap(mode: OsuMode = this.mode): Promise<Beatmap> {
		if (this._beatmap) return this._beatmap;

		this._beatmap = require('./Beatmap').fetch(this.beatmapId, mode);

		return this._beatmap;
	}

	/**
	 * Fetch the user that achieved the score.
	 */
	public async fetchUser(): Promise<User> {
		if (this._user) return this._user;

		this._user = require('./User').fetchBasic(this.userId);

		return this._user;
	}
}
