import { config } from 'raven';
const { ravenToken } = require('../data');
config(process.env.NODE_ENV !== 'dev' && ravenToken, {
	captureUnhandledRejections: true,
	autoBreadcrumbs: true,
}).install();

import { extendAll } from './extensions/Extension';
extendAll();

import { Logger } from './structures/Logger';

process.on('unhandledRejection', (error: Error) => {
	Logger.instance.error('REJECTION', error);
});

import { Client } from './structures/Client';
import { PostgreSQL } from './structures/PostgreSQL';
import { Redis } from './structures/Redis';

PostgreSQL.instance.start();
Redis.instance.start();

const client: Client = new Client({ disableEveryone: true });

client.login();
