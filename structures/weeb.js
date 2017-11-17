const { weebToken } = require('../data');
const Api = require('./Api');

const api = Api.register('weeb-sh', {
	baseURL: 'https://api.weeb.sh',
	defaultHeaders: { Authorization: weebToken }
});

module.exports = {
	fetchTags: (showHidden = null) => api.query({ showHidden }).get('/images/tags').then(res => res.tags),
	fetchTypes: (showHidden = null) => api.query({ showHidden }).get('/images/types').then(res => res.types),
	// Adding a class here wouldn't make sense; It's literally just an object
	// For reference: https://docs.weeb.sh/#/images/get_images_random
	fetchRandom: ({ type = null, tags = null, hidden = null, nsfw = null, filetype = null } = {}) => {
		if (!type && !tags) throw new Error('One of "type" or "tags" is required to fetch an image!');
		return api.query({ type, tags, hidden, nsfw, filetype }).get('/images/random');
	}
};
