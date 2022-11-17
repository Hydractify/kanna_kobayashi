import { emitWarning } from 'node:process';
import { init as sentryInit } from '@sentry/node';
// For side-effects
import '@sentry/tracing';
import { SENTRY_DSN } from './config.js';

let initialized = false;
export function init() {
	if (initialized) {
		return;
	}

	initialized = true;

	if (!SENTRY_DSN) {
		console.log('test');
		emitWarning('No sentry dsn specified; No events will be reported!', 'MissingConfigurationWarning');
		return;
	}

	sentryInit({
		dsn: SENTRY_DSN!,
	});
}
