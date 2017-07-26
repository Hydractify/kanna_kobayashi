const Raven = require('raven');
const log = require('./sentry');

module.exports = async (message, e) =>
{	console.log(`\n\x1b[41m\x1b[30m[ERROR]\x1b[0m ${message}`);
	await Raven.captureException(e);
	log('Sent an Error to sentry.io!');	} // Logs Red and sends error to sentry