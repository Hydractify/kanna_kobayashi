// tslint:disable-next-line:no-import-side-effect no-submodule-imports
import 'source-map-support/register';

// Hack to ensure that the WebhookLogger is instantiated first
import { WebhookLogger } from './structures/WebhookLogger';
WebhookLogger.instance.info('Process spawn', parseInt(process.env.SHARDS!), `Process spawned (${process.env.SHARDS})`);

import { config } from 'raven';
const { ravenToken, clientToken } = require('../data');
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

let client: Client | undefined;

process.on('unhandledRejection', (error: Error) => {
	if (client) client.errorCount.inc({ type: 'PromiseRejection' });

	const promise: Promise<void> = Logger.instance.error('REJECTION', error);
	if (error instanceof TimeoutError) {
		promise.then(() => process.exit(1));
	}
});

import { Client } from './structures/Client';
import { PostgreSQL } from './structures/PostgreSQL';
import { Prometheus } from './structures/Prometheus';

PostgreSQL.instance.start();
Prometheus.instance.start();

client = new Client({
	disableEveryone: true,
	messageCacheMaxSize: 5,
	partials: ['MESSAGE'],
});

client
	.login(clientToken)
	.catch((error: Error) => client!.webhook.error('LOGIN', error).finally(() => process.exit(1)));
