const moment = require('moment');

const { instance: { db: redis } } = require('../Redis');
const Api = require('../Api').get('osu');
const Score = require('./Score');

class Beatmap {
	static async fetch(id, mode = 0) {
		let data = await redis.hgetallAsync(`osu:beatmaps:${id}_${mode}`);

		if (!data) {
			[data] = await Api.query({ a: 1, b: id, m: mode, limit: 1 }).get('/get_beatmaps') || [];

			if (!data) return null;

			// Because the api apparently sometimes does not respond with the correct mode
			// All other properties are correct however /shrug
			data.mode = mode;
			// Only cache loved, approved and ranked beatmaps
			if (['4', '2', '1'].includes(data.approved)) {
				if (!data.max_combo) delete data.max_combo;
				redis.hmsetAsync(`osu:beatmaps:${id}_${mode}`, data)
					// TODO: Properly log redis errors
					.catch(() => null);
			}
		}

		return new this(data);
	}

	static async fetchSet(id) {
		const already = await redis.smembersAsync(`osu:beatmapsets:${id}`);

		let data;
		if (already.length) {
			const multi = redis.multi();
			for (const alreadyId of already) {
				multi.hgetall(`osu:beatmaps:${alreadyId}`);
			}
			data = await multi.execAsync().catch(() => null);
		}

		const maps = [];
		if (data && data.length) {
			for (const map of data) {
				maps.push(new this(map));
			}

			return maps;
		}

		data = await Api.query({ s: id }).get('/get_beatmaps');

		if (!data || !data.length) return null;

		if (['4', '2', '1'].includes(data[0].approved)) {
			const multi = redis.multi();

			const ids = [];
			for (const map of data) {
				multi.hmset(`osu:beatmaps:${map.beatmap_id}_${map.mode}`, map);
				ids.push(`${map.beatmap_id}_${map.mode}`);
				maps.push(new this(map));
			}

			multi
				.sadd(`osu:beatmapsets:${data[0].beatmapset_id}`, ids)
				.execAsync()
				// TODO: Properly log redis errors
				.catch(() => null);
		} else {
			for (const map of data) {
				maps.push(new this(map));
			}
		}

		return maps;
	}

	constructor(data) {
		this.approvedId = data.approved;
		this.approvedAt = data.approved_date ? moment.utc(`${data.approved_date}+08:00`) : null;
		this.lastUpdatedAt = moment.utc(`${data.last_update}+80:00`);
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
		this.playLength = Number(data.hit_length);
		this.genreId = data.genre_id;
		this.languageId = data.language_id;
		this.title = data.title;
		this.length = Number(data.total_length);
		this.version = data.version;
		// Technically a thing: this.fileMD5 = data.file_md5;
		this.mode = Number(data.mode);
		this.tags = data.tags.replace(/ +/g, ', ');
		this.favoriteCount = Number(data.favourite_count);
		this.playCount = Number(data.playcount);
		this.passCount = Number(data.passcount);
		// Taiko has no max combo for some reason
		this.maxCombo = data.max_combo ? Number(data.max_combo) : null;
	}

	async fetchBestScores({ limit = 10, mode = this.mode } = {}) {
		const scores = await Api.query({ b: this.id, m: mode, limit }).get('/get_scores');

		const promises = [];
		for (const data of scores) {
			const score = new Score(data, { beatmap: this, mode });
			promises.push(score.fetchUser().then(() => score));
		}

		return Promise.all(promises);
	}

	get approved() {
		return Beatmap.approvedStates[this.approvedId];
	}

	get genre() {
		return Beatmap.genres[this.genreId];
	}

	get language() {
		return Beatmap.languages[this.languageId];
	}

	get iconURL() {
		return `https://b.ppy.sh/thumb/${this.setId}l.jpg`;
	}

	get setURL() {
		return `https://osu.ppy.sh/s/${this.setId}`;
	}

	versionURL(mode = this.mode) {
		return `https://osu.ppy.sh/b/${this.id}&m=${mode}`;
	}
}

Beatmap.approvedStates = {
	'-2': 'Graveyarded',
	'-1': 'WIP',
	0: 'Pending',
	1: 'Ranked',
	2: 'Approved',
	3: 'Qualified',
	4: 'Lovd'
};

Beatmap.genres = [
	'Any',
	'Unspecified',
	'Video Game',
	'Anime',
	'Rock',
	'Pop',
	'Other',
	'Novelty',
	// 8 is not present
	null,
	'Hip hop',
	'Electronic'
];

Beatmap.languages = [
	'Any',
	'Other',
	'English',
	'Japanese',
	'Chinese',
	'Instrumental',
	'Korean',
	'French',
	'German',
	'Swedish',
	'Spanish',
	'Italian'
];


module.exports = Beatmap;
