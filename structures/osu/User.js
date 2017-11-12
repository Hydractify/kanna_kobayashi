const { instance: { db: redis } } = require('../Redis');

const Api = require('../Api').get('osu');
const Score = require('./Score');

class User {
	static async fetch(query, mode = 0) {
		const [data] = await Api.query({ u: query, limit: 1, m: mode }).get('/get_user');

		if (!data) return null;

		redis.multi()
			.hmset(`osu:users:${data.user_id}`, {
				country: data.country,
				// eslint-disable-next-line camelcase
				user_id: data.user_id,
				username: data.username
			})
			.set(`osu:usernames:${data.username.toLowerCase()}`, data.user_id)
			.execAsync()
			// TODO: Properly log redis errors
			.catch(() => null);

		return new this(data);
	}

	static async fetchBasic(query) {
		query = await redis.getAsync(`osu:usernames:${String(query).toLowerCase()}`) || query;
		let data = await redis.hgetallAsync(`osu:users:${query}`);

		if (!data) return this.fetch(query);

		return new this(data, false);
	}

	constructor(data, full = true) {
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

	async fetchBest({ limit = 10, mode = 0 } = {}) {
		const scores = await Api.query({ u: this.id, type: 'id', m: mode, limit }).get('/get_user_best');

		const promises = [];
		for (const data of scores) {
			const score = new Score(data, { user: this, mode });

			promises.push(score.fetchBeatmap(mode).then(() => score));
		}

		return Promise.all(promises);
	}

	async fetchRecent({ limit = 10, mode = 0 } = {}) {
		const scores = await Api.query({ u: this.id, type: 'id', m: mode, limit }).get('/get_user_recent');

		const promises = [];
		for (const data of scores) {
			const score = new Score(data, { user: this, mode });

			promises.push(score.fetchBeatmap(mode).then(() => score));
		}

		return Promise.all(promises);
	}

	get countryFlag() {
		return this.country.split('').map(char => User.FlagChars[char]).join('');
	}

	get iconURL() {
		// Without file extension, yes
		return `https://a.ppy.sh/${this.id}`;
	}

	get profileURL() {
		return `https://osu.ppy.sh/u/${this.id}`;
	}
}

/* eslint-disable id-length */
User.FlagChars = {
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
	Z: '🇿'
};
/* eslint-enable id-length */

module.exports = User;
