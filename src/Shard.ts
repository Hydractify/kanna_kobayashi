// tslint:disable-next-line:no-import-side-effect no-submodule-imports
import 'source-map-support/register';

import { Shard, ShardingManager } from 'discord.js';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { join } from 'path';
import { AggregatorRegistry, register } from 'prom-client';
import { parse } from 'url';

import { WebhookLogger } from './structures/WebhookLogger';

const webhook: WebhookLogger = WebhookLogger.instance;
webhook.info('Manager Spawn', 'Manager', 'Manager spawned.');

process.on('unhandledRejection', (error: Error) => {
	webhook.error('REJECTION', error);
});

const { clientToken: token }: { clientToken: string } = require('../data');

const manager: ShardingManager = new ShardingManager(join(__dirname, 'index.js'), {
	token,
});

manager.spawn(manager.totalShards, 5500, false);

manager.on('shardCreate', (shard: Shard) => {
	webhook.info('Shard Create', shard.id, 'Shard created.');
	shard
		.on('death', () => webhook.error('Shard Death', shard.id, 'Shard died.'))
		.on('error', (error: Error) => webhook.error('Shard Error', shard.id, 'Shard errored:', error))
		.on('spawn', () => webhook.info('Shard Spawn', shard.id, 'Shard spawned.'));
});

createServer(async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
	try {
		if (parse(req.url!).pathname === '/metrics') {
			const metrics: object[][] = await manager.broadcastEval('this.getMetrics()');
			res.writeHead(200, { 'content-type': register.contentType });
			res.write(AggregatorRegistry.aggregate(metrics).metrics());
		} else {
			res.writeHead(404, { 'content-type': register.contentType });
			res.write('Route not found');
		}
	} catch (e) {
		webhook.error('Prometheus', e);

		res.writeHead(500, { 'content-type': register.contentType });
		res.write('Internal Server Error');
	}
	res.end();
}).listen(9001, () => webhook.info('Prometheus', 'Listening for requests...'));
