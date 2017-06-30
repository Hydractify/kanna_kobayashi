const log = require('../../util/log.js');
const moment = require('moment');

module.exports = client => {
  log.bot(`Bot reconnecting ${moment().format('HH:mm')} [${moment().format('DD/MM/YYYY')}]`);
};
