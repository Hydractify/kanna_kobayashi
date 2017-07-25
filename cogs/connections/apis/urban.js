const superagent = require('superagent');
const log = require('../../../util/log/error');

module.exports = (word) =>
{	if (typeof word !== 'string') throw new Error('Word must be a String!');
	return superagent
	.get(`http://api.urbandictionary.com/v0/define?term=${word}`)
	.catch(e => log(e.stack)); 	}