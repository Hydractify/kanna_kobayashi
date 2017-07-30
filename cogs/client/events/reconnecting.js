const moment = require('moment');
const log = require('../../../util/log/bot');

module.exports = async () => {
  log(`Bot reconnecting ${moment().format('HH:mm \\[DD/MM/YYYY\\]')}`);
}
