const log = require('../../../util/log/bot');
const moment = require('moment');

module.exports = (client) =>
{	return log(`Bot disconnected ${moment().format('HH:mm')} [${moment().format('DD/MM/YYYY')}]\nCode: ${disconnect.code}\nReason: ${disconnect.reason}`);	}