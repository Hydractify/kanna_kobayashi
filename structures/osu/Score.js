const moment = require('moment');

class Score {
	constructor(data, { beatmap = null, user = null, mode = null } = {}) {
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
		this.date = moment.utc(`${data.date}+08:00`);
		this.rank = data.rank;
		this.pp = data.pp ? Number(data.pp) : null;

		this._beatmap = beatmap;
		this._user = user;
	}

	async fetchBeatmap(mode = this.mode) {
		if (this._beatmap) return this._beatmap;

		// Avoid circular
		this._beatmap = await require('./Beatmap').fetch(this.beatmapId, mode);

		return this._beatmap;
	}

	async fetchUser() {
		if (this._user) return this._user;

		// Avoid circular
		this._user = await require('./User').fetchBasic(this.userId);

		return this._user;
	}

	accuracy(mode = this.mode) {
		let hits;
		let total;

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
		}

		return hits / total;
	}

	get enabledMods() {
		if (!this._enabledMods) return 'None';
		const enabledMods = new Set();

		for (const mod in Score.Mods) {
			// eslint-disable-next-line no-bitwise
			if ((this._enabledMods & Score.Mods[mod]) === Score.Mods[mod]) {
				enabledMods.add(mod);
			}
		}

		if (enabledMods.has('NC')) enabledMods.delete('DT');
		if (enabledMods.has('PF')) enabledMods.delete('SD');

		return Array.from(enabledMods.values()).join(', ');
	}
}

/* eslint-disable no-bitwise */
Score.Mods = {
	NF: 1 << 0,
	EZ: 1 << 1,
	NoVideo: 1 << 2,
	HD: 1 << 3,
	HR: 1 << 4,
	SD: 1 << 5,
	DT: 1 << 6,
	RX: 1 << 7,
	HT: 1 << 8,
	NC: 1 << 9,
	FL: 1 << 10,
	AP: 1 << 11,
	SO: 1 << 12,
	// Whatever Relax 2 is...
	RX2: 1 << 13,
	PF: 1 << 14,
	Key4: 1 << 15,
	Key5: 1 << 16,
	Key6: 1 << 17,
	Key7: 1 << 18,
	Key8: 1 << 19,
	keyMod: null,
	FadeIn: 1 << 20,
	Random: 1 << 21,
	LastMod: 1 << 22,
	FreeModAllowed: null,
	// No 1 << 23, /shrug
	Key9: 1 << 24,
	Key10: 1 << 25,
	Key1: 1 << 26,
	Key3: 1 << 27,
	Key2: 1 << 28
};

Score.Mods.keyMod = Score.Mods.Key4
	| Score.Mods.Key5
	| Score.Mods.Key6
	| Score.Mods.Key7
	| Score.Mods.Key8;

Score.Mods.FreeModAllowed = Score.Mods.NF
	| Score.Mods.EZ
	| Score.Mods.HD
	| Score.Mods.HR
	| Score.Mods.SD
	| Score.Mods.FL
	| Score.Mods.FadeIn
	| Score.Mods.RX
	| Score.Mods.RX2
	| Score.Mods.SO
	| Score.Mods.keyMod;
/* eslint-enable no-bitwise */

module.exports = Score;
