const moment = require('moment');

module.exports = client => {
  require('../../util/log.js').bot(`Bot reconnecting ${moment().format('HH:mm')} [${moment().format('DD/MM/YYYY')}]`);
};
