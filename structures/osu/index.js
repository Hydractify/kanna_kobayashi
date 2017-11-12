const { osuToken } = require('../../data');
const Api = require('../Api');

Api.register('osu', { baseURL: 'https://osu.ppy.sh/api', queryParams: { k: osuToken } });

module.exports = {
	Beatmap: require('./Beatmap'),
	Score: require('./Score'),
	User: require('./User')
};
