// tslint:disable-next-line:no-import-side-effect no-submodule-imports
import 'source-map-support/register';

import { config } from 'raven';
const { ravenToken } = require('../data');
config(process.env.NODE_ENV && process.env.NODE_ENV !== 'dev' && ravenToken, {
	autoBreadcrumbs: true,
	captureUnhandledRejections: true,
	environment: process.env.NODE_ENV,
	release: require('../package.json').version,
}).install();

import { extendAll } from './extensions/Extension';
extendAll();

// tslint:disable-next-line:no-submodule-imports no-implicit-dependencies
const { TimeoutError } = require('generic-pool/lib/errors');
import { Logger } from './structures/Logger';

process.on('unhandledRejection', (error: Error) => {
	const promise: Promise<void> = Logger.instance.error('REJECTION', error);
	if (error instanceof TimeoutError) {
		promise.then(() => process.exit(1));
	}
});

import { Client } from './structures/Client';
import { PostgreSQL } from './structures/PostgreSQL';
import { Redis } from './structures/Redis';

PostgreSQL.instance.start();
Redis.instance.start();

const client: Client = new Client({
	disableEveryone: true,
	messageCacheMaxSize: 5,
});

client.login()
	.catch((error: Error) => client.webhook.error('LOGIN', error)
		.then(() => process.exit(1), () => process.exit(1)));
