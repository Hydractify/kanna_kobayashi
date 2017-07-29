const log = require('../../../util/log/bot');
const moment = require('moment');

module.exports = async (client, disconnect) =>
{	return log(`Bot disconnected ${moment().format('HH:mm \\[DD/MM/YYYY\\]')}\nCode: ${disconnect.code}\nReason: ${disconnect.reason}`);	}
