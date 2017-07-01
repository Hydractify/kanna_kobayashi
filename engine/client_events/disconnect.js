const log = require('../../util/log.js');
const moment = require('moment');

module.exports = client => {
  require('../../util/log.js').bot(`Bot disconnected ${moment().format('HH:mm')} [${moment().format('DD/MM/YYYY')}]\nCode: ${disconnect.code}\nReason: ${disconnect.reason}`);
};
