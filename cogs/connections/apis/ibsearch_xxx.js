const log = require('../../../util/log/error');
const superagent = require('superagent');

module.exports = (tag) =>
{	if (typeof tag !== 'string')
	{	throw new Error('Tag must be a String');	}
	return superagent
	.get(`https://ibsearch.xxx/api/v1/images.json?key=${settings.keys.ibsearch_xxx}&q=${tag}+rating:e&limit=5`)
	.catch((e) =>
	{	log(e);	}	)	}