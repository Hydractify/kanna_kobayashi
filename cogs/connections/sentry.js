const Raven = require('raven');
const log = require('../../util/log/sentry');

exports.start = () => {
	Raven.config('https://27e26b64bed14c6a84bd91f35a52d914:6f98cea9e01a4eba86cfe139ed97e8aa@sentry.io/196287').install();
	log('Sucessfully connected to Sentry');
}
