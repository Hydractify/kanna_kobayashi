const moment = require('moment');
const log = require('../../../util/log/bot');

module.exports = async (client) =>
{	log(`Bot reconnecting ${moment().format('HH:mm')} [${moment().format('DD/MM/YYYY')}]`);	}