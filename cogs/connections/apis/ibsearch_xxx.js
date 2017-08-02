const superagent = require('superagent');

const keys = require('../../../data/auth/keys');
const log = require('../../../util/log/error');

module.exports = tag => {
    if (typeof tag !== 'string') {
        throw new TypeError('Tag must be a string!');
    }

    return superagent
        .get(`https://ibsearch.xxx/api/v1/images.json?key=${keys.ibsearch_xxx}&q=${tag}+rating:e&limit=5`)
        .then(res => res.body)
        .catch(error => log(error.stack, error));
};
