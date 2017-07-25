const log = require('../../../util/log/error');
const superagent = require('superagent');

module.exports = (type) =>
{	if (typeof type !== 'string')
	{	throw new Error('Type must be a String');	}
	return superagent
	.get(`https://rra.ram.moe/i/r?type=${type}`)
	.catch(e => log(e.stack));	}