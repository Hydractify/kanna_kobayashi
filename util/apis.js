const superagent = require('superagent');
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
}
