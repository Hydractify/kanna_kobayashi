const superagent = require('superagent');

const keys = require('../../../data/auth/keys');
const log = require('../../../util/log/error');

module.exports = tag => {
    if (typeof tag !== 'string') {
        throw new TypeError('Tag must be a string!');
    }

    return superagent
        .get(`https://ibsear.ch/api/v1/images.json?key=${keys.ibsearch}&q=${tag}+rating:s&limit=5`)
        .then(res => res.body)
        .catch(error => log(error.stack, error));
};
