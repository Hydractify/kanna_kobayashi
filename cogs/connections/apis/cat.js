const log = require('../../../util/log/error');
const superagent = require('superagent');

module.exports = () =>
{	return superagent
	.get('http://random.cat/meow')
	.catch(log)	}