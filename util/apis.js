const superagent = require('superagent');
const settings = require('./settings');
const log = require('./log');

module.exports = class APIs
{
  static wolke(type)
  {
    if (typeof type !== 'string') throw new Error('Type must be a String!');

    return superagent
    .get(`https://rra.ram.moe/i/r?type=${type}`)
    .catch(e => log.error(e.stack));
  }

  static meow()
  {
    return superagent
    .get('http://random.cat/meow')
    .catch(e => log.error(e.stack));
  }

  static ibsearch(tag)
  {
    return superagent
    .get(`https://ibsear.ch/api/v1/images.json?key=${settings.keys.ibsearch}&q=${tag}-rating:e&limit=5`)
    .catch(e => log.error(e.stack));
  }

  static ibsearch_xxx(tag)
  {
    return superagent
    .get(`https://ibsearch.xxx/api/v1/images.json?key=${settings.keys.ibsearch_xxx}&q=${tag}+rating:e&limit=5`)
    .catch(e => log.error(e.stack));
  }
}
