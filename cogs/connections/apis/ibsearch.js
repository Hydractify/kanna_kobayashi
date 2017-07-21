const log = require('../../../util/log/error');
const superagent = require('superagent'); 
const keys = require('../../../data/auth/keys');

module.exports = (tag) =>
{	if (typeof tag !== 'string')
	{	throw new Error('Tag must be a String');	}
	return require('superagent')
	.get(`https://ibsear.ch/api/v1/images.json?key=${keys.ibsearch}&q=${tag}-rating:e&limit=5`)
	.catch(e => log(e.stack))	}