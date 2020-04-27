// tslint:disable-next-line:no-import-side-effect no-submodule-imports
import 'source-map-support/register';

import { Shard, ShardingManager } from 'discord.js';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { join } from 'path';
import { AggregatorRegistry, register } from 'prom-client';
import { parse } from 'url';

import { WebhookLogger } from './structures/WebhookLogger';
import { IPCMessageType } from './types/IPCMessageType';

const webhook: WebhookLogger = WebhookLogger.instance;
webhook.info('Manager Spawn', 'Manager', 'Manager spawned.');

process.on('unhandledRejection', (error: {} | null | undefined) => webhook.error('REJECTION', 'Manager', error));

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { clientToken: token, httpPort }: { clientToken: string; httpPort: number } = require('../data');

const manager: ShardingManager = new ShardingManager(join(__dirname, 'index.js'), {
	token,
});

manager.spawn(manager.totalShards, 5500, Infinity);

manager.on('shardCreate', (shard: Shard) =>
{
	webhook.info('Shard Create', shard.id, 'Shard created.');
	shard
		.on('message', message =>
		{
			if (message.__kanna__ !== true) return;
			switch (message.type)
			{
				case IPCMessageType.RESTART: {
					const shard: Shard | undefined = manager.shards.get(message.target);
					if (shard)
					{
						shard.respawn(500, Infinity);
					}
					else
					{
						webhook.warn('IPCMESSAGE', 'Manager', `Received a restart request for an unknown shard: ${message.target}`);
					}
					break;
				}

				case IPCMessageType.RESTART_ALL:
					manager.respawnAll(5500, 500, Infinity);
					break;

				default:
					webhook.warn('IPCMESSAGE', 'Manager', `Received an unexpected message type: ${message.type}`);
					break;
			}
		})
		.on('death', () => webhook.warn('Shard Death', shard.id, 'Shard died.'))
		.on('error', (error: Error) => webhook.error('Shard Error', shard.id, 'Shard errored:', error))
		.on('spawn', () => webhook.warn('Shard Spawn', shard.id, 'Shard spawned.'));
});

createServer(async (req: IncomingMessage, res: ServerResponse): Promise<void> =>
{
	try
	{
		if (parse(req.url ?? '').pathname === '/metrics')
		{
			const metrics: object[][] = await manager.broadcastEval('this.getMetrics()');
			res.writeHead(200, { 'content-type': register.contentType });
			res.write(AggregatorRegistry.aggregate(metrics).metrics());
		}
		else
		{
			res.writeHead(404, { 'content-type': register.contentType });
			res.write('Route not found');
		}
	}
	catch (e)
	{
		webhook.error('Prometheus', 'Manager', e);

		res.writeHead(500, { 'content-type': register.contentType });
		res.write('Internal Server Error');
	}
	res.end();
}).listen(httpPort, () => webhook.info('Prometheus', 'Manager', 'Listening for requests...'));
